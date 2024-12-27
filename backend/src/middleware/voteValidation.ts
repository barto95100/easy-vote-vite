import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { createHash } from 'crypto';

export const validateVote: RequestHandler = async (req, res, next) => {
  try {
    const { id: pollId } = req.params;
    const { browserId } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || '';
    
    if (!browserId) {
      return res.status(400).json({
        message: 'Identifiant de navigateur manquant'
      });
    }

    // Créer un fingerprint unique basé sur plusieurs facteurs
    const fingerprint = createHash('sha256')
      .update(`${pollId}-${ip}-${userAgent}-${browserId}`)
      .digest('hex');

    // Vérifier les votes existants avec ce fingerprint ou browserId
    const existingVote = await prisma.vote.findFirst({
      where: {
        pollId,
        OR: [
          { fingerprint },
          { browserId }
        ]
      }
    });

    if (existingVote) {
      return res.status(403).json({
        message: 'Vous avez déjà voté pour ce sondage'
      });
    }

    // Stocker le fingerprint et browserId dans la requête
    req.body.fingerprint = fingerprint;
    
    // Vérifier les votes suspects
    const recentVotes = await prisma.vote.count({
      where: {
        ip,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000)
        }
      }
    });

    if (recentVotes > 10) {
      return res.status(429).json({
        message: 'Trop de votes détectés. Veuillez patienter quelques minutes.'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur de validation du vote:', error);
    res.status(500).json({ message: 'Erreur lors de la validation du vote' });
  }
}; 