import express, { RequestHandler, Request, Response } from 'express';
import prisma from '../lib/prisma';
import crypto from 'crypto';
import { validatePollCreation, validateVote, validatePollAccess } from '../middleware/validators';
import { EmailService } from '../services/email';
import { validateEmails } from '../utils/validation';
import bcrypt from 'bcrypt';
import { broadcastPollUpdate } from '../websocket';
import { getRealIp } from '../utils/ip';

const router = express.Router();

// Définir un type personnalisé pour les handlers
type CustomRequestHandler = (
  req: Request,
  res: Response
) => Promise<void> | void;

// GET /api/polls
const getAllPolls: RequestHandler = async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      include: {
        options: true,
        _count: {
          select: { votes: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer les données pour inclure le total des votes
    const formattedPolls = polls.map(poll => ({
      ...poll,
      totalVotes: poll._count.votes,
      options: poll.options.map(option => ({
        ...option,
        votes: option.votes?.length || 0
      }))
    }));

    res.json(formattedPolls);
  } catch (error) {
    console.error('Erreur lors de la récupération des sondages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des sondages' });
  }
};

// GET /api/polls/:id
const getPollById: CustomRequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const ip = req.ip;

    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: true
      }
    });

    if (!poll) {
      return res.status(404).json({ message: 'Sondage non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.vote.findFirst({
      where: {
        pollId: id,
        ip: ip
      }
    });

    const { password: _, ...pollData } = poll;
    
    res.json({
      ...pollData,
      hasVoted: !!existingVote,
      userVote: existingVote?.optionId
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/polls
const createPoll: RequestHandler = async (req, res) => {
  try {
    console.log('Données reçues dans la route:', req.body);
    
    const { title, description, options, password, expiresAt, isPrivate, emails } = req.body;

    // Hash le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le sondage avec le mot de passe hashé
    const poll = await prisma.poll.create({
      data: {
        title,
        description: description || '',
        expiresAt: new Date(expiresAt),
        password: hashedPassword,
        isPrivate: isPrivate || false,
        options: {
          create: options.map((option: { text: string }) => ({
            text: option.text.trim()
          }))
        }
      },
      include: {
        options: true
      }
    });

    // Si des emails sont fournis, créer et envoyer les invitations
    if (emails && emails.length > 0) {
      const validatedEmails = validateEmails(emails);
      
      await Promise.all(
        validatedEmails.map(async (email) => {
          const token = crypto.randomBytes(32).toString('hex');
          
          // Créer l'invitation
          await prisma.pollInvitation.create({
            data: {
              pollId: poll.id,
              email,
              token,
              status: 'PENDING'
            }
          });

          // Envoyer l'email d'invitation
          await EmailService.sendInvitation(email, title, poll.id, token, description);
        })
      );
    }

    // Broadcast uniquement si la création a réussi
    try {
      broadcastPollUpdate(poll.id, 'UPDATE');
    } catch (wsError) {
      console.error('Erreur WebSocket lors du broadcast:', wsError);
    }

    res.status(201).json(poll);
  } catch (error) {
    console.error('Erreur lors de la création du sondage:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création du sondage',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Fonction pour générer une empreinte unique
const generateVoterFingerprint = (data: {
  ip: string;
  userAgent: string;
  acceptLanguage: string;
  timestamp: string;
  screenResolution?: string;
  timezone?: string;
  platform?: string;
  webglVendor?: string;
  webglRenderer?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  colorDepth?: number;
  touchPoints?: number;
  languages?: string;
  pollId: string;
}): string => {
  const values = Object.values(data).filter(Boolean);
  const combinedData = values.join('|');
  
  return crypto
    .createHash('sha256')
    .update(combinedData)
    .digest('hex');
};

const cleanIpv6 = (ip: string) => ip.replace(/^::ffff:/, '');

const votePoll: RequestHandler = async (req, res) => {
  try {
    const { id: pollId } = req.params;
    const { optionId, fingerprint } = req.body;
    const ip = getRealIp(req);

    console.log('🔍 Vérification du vote:', {
      ip,
      fingerprint,
      hardwareInfo: req.body.hardwareInfo // Log des infos matérielles
    });

    // 1. Vérification par fingerprint d'abord (plus fiable)
    const existingVoteByFingerprint = await prisma.vote.findFirst({
      where: {
        pollId,
        fingerprint
      }
    });

    if (existingVoteByFingerprint) {
      return res.status(400).json({
        message: 'Vous avez déjà voté pour ce sondage depuis cet appareil'
      });
    }

    // 2. Vérification par IP ensuite (backup)
    const existingVoteByIP = await prisma.vote.findFirst({
      where: {
        pollId,
        ip
      }
    });

    if (existingVoteByIP) {
      // Vérifier si le fingerprint est très différent
      if (existingVoteByIP.fingerprint !== fingerprint) {
        return res.status(400).json({
          message: 'Un vote a déjà été enregistré depuis cette adresse IP'
        });
      }
    }

    // Si les vérifications passent, continuer avec le vote...
    await prisma.$transaction(async (prisma) => {
      // Créer le vote
      await prisma.vote.create({
        data: {
          pollId,
          optionId,
          ip,
          userAgent: req.headers['user-agent'] || '',
          fingerprint
        }
      });

      // Incrémenter le compteur de votes de l'option
      await prisma.option.update({
        where: { id: optionId },
        data: {
          votes: {
            increment: 1
          }
        }
      });

      // Incrémenter le compteur total du sondage
      await prisma.poll.update({
        where: { id: pollId },
        data: {
          totalVotes: {
            increment: 1
          }
        }
      });
    });

    // Récupérer le sondage mis à jour
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
        _count: {
          select: { votes: true }
        }
      }
    });

    // Broadcast du vote via WebSocket
    broadcastPollUpdate(pollId, 'VOTE', {
      pollId,
      options: updatedPoll?.options,
      totalVotes: updatedPoll?._count.votes,
      lastVote: {
        optionId
      }
    });

    res.json(updatedPoll);
  } catch (error) {
    console.error('Erreur lors du vote:', error);
    res.status(500).json({ message: 'Erreur lors du vote' });
  }
};

const closePoll: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const poll = await prisma.poll.findUnique({
      where: { id }
    });

    if (!poll) {
      return res.status(404).json({ message: 'Sondage non trouvé' });
    }

    // Vérification sécurisée du mot de passe
    const isPasswordValid = await bcrypt.compare(password, poll.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const updatedPoll = await prisma.poll.update({
      where: { id },
      data: { isClosed: true },
      include: { 
        options: true,
        _count: {
          select: { votes: true }
        }
      }
    });

    // Broadcast avec toutes les données nécessaires
    broadcastPollUpdate(id, 'CLOSED', {
      pollId: id,
      poll: {
        ...updatedPoll,
        isClosed: true,
        options: updatedPoll.options,
        totalVotes: updatedPoll._count.votes
      }
    });

    res.json(updatedPoll);
  } catch (error) {
    console.error('Erreur lors de la fermeture du sondage:', error);
    res.status(500).json({ message: 'Erreur lors de la fermeture du sondage' });
  }
};

const deletePoll: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const poll = await prisma.poll.findUnique({
      where: { id }
    });

    if (!poll) {
      return res.status(404).json({ message: 'Sondage non trouvé' });
    }

    // Vérification sécurisée du mot de passe
    const isPasswordValid = await bcrypt.compare(password, poll.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: 'Mot de passe incorrect' });
    }

    // Supprimer le sondage
    await prisma.poll.delete({
      where: { id }
    });

    // Notifier tous les clients de la suppression
    broadcastPollUpdate(id, 'DELETED', {
      pollId: id
    });

    res.json({ message: 'Sondage supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du sondage:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du sondage' });
  }
};

const sharePoll: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { emails, title } = req.body;

    // Valider les emails
    const validatedEmails = validateEmails(emails);

    const poll = await prisma.poll.findUnique({
      where: { id }
    });

    if (!poll) {
      return res.status(404).json({ message: 'Sondage non trouvé' });
    }

    const results = await Promise.allSettled(
      validatedEmails.map(async (email) => {
        const token = crypto.randomBytes(32).toString('hex');
        
        const invitation = await prisma.pollInvitation.create({
          data: {
            pollId: id,
            email,
            token,
            status: 'PENDING'
          }
        });

        await EmailService.sendInvitation(email, title, id, token);
        return invitation;
      })
    );

    // Gérer les résultats
    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');

    if (failures.length > 0) {
      console.error('Erreurs lors de l\'envoi des invitations:', failures);
    }

    res.json({
      message: `${successes.length} invitation(s) envoyée(s) avec succès${failures.length > 0 ? `, ${failures.length} échec(s)` : ''}`,
      successes: successes.length,
      failures: failures.length
    });
  } catch (error) {
    console.error('Erreur lors du partage:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'envoi des invitations',
      error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    });
  }
};

// Vérifier un token d'invitation
router.get('/:id/verify-token', async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;

  try {
    const invitation = await prisma.pollInvitation.findFirst({
      where: {
        pollId: id,
        token: token as string
      }
    });

    res.json({ 
      isValid: !!invitation,
      hasVoted: invitation?.status === 'VOTED'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Routes avec validation
router.get('/', getAllPolls);
router.get('/:id', getPollById);
router.post('/', validatePollCreation, createPoll);
router.post('/:id/vote', validateVote, votePoll);
router.post('/:id/close', validatePollAccess, closePoll);
router.delete('/:id', validatePollAccess, deletePoll);
router.post('/:id/share', validatePollAccess, sharePoll);

router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

export default router;
