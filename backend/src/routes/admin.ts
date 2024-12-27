import express from 'express';
import { AdminService } from '../services/admin';
import { authMiddleware } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = express.Router();

const SESSION_DURATION = '10m'; // 10 minutes

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    console.log('📨 Tentative de connexion admin');
    console.log('Mot de passe reçu:', password);
    console.log('Mot de passe attendu:', process.env.DEFAULT_ADMIN_PASSWORD);
    
    if (!password) {
      return res.status(400).json({ 
        message: 'Le mot de passe est requis' 
      });
    }

    // Vérification stricte du mot de passe
    if (password !== process.env.DEFAULT_ADMIN_PASSWORD) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ 
        message: 'Mot de passe incorrect' 
      });
    }

    console.log('✅ Mot de passe correct, génération du token');
    
    // Générer un token JWT avec une expiration de 10 minutes
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: SESSION_DURATION }
    );

    console.log('✅ Token généré avec succès');

    res.json({
      message: 'Connexion réussie',
      token,
      expiresIn: 600 // 10 minutes en secondes
    });
  } catch (error) {
    console.error('Erreur de connexion admin:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Route protégée pour récupérer la configuration
router.get('/config', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Demande de configuration reçue');
    const config = await AdminService.getConfig();
    
    if (!config) {
      return res.status(404).json({ 
        message: 'Configuration non trouvée' 
      });
    }

    res.json(config);
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ 
      message: 'Erreur lors du chargement de la configuration' 
    });
  }
});

// Route protégée pour mettre à jour la configuration
router.post('/config', authMiddleware, async (req, res) => {
  try {
    const { smtp, security } = req.body;
    await AdminService.updateConfig(smtp, security);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la configuration:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la configuration' });
  }
});

// Fonction pour extraire l'email d'une chaîne au format "Nom <email>"
const extractEmail = (fromString: string) => {
  // Décode d'abord les entités HTML
  const decoded = fromString.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  
  if (decoded.includes('<')) {
    return decoded.split('<')[1].replace('>', '').trim();
  }
  return decoded.trim();
};

router.post('/smtp/test', authMiddleware, async (req, res) => {
  try {
    const { host, port, user, password, from, testEmail } = req.body;
    
    // Configuration SMTP - identique à celle du fichier .env
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: req.body.secure || false,
      auth: {
        user,
        pass: password
      },
      tls: {
        rejectUnauthorized: false // Pour les serveurs avec des certificats auto-signés
      }
    });

    // Envoi de l'email de test
    await transporter.sendMail({
      from: extractEmail(from), // Utilise uniquement l'adresse email
      to: testEmail,
      subject: 'Test de configuration SMTP EasyVote',
      text: 'Si vous recevez cet email, la configuration SMTP est fonctionnelle.'
    });

    res.json({ success: true, message: 'Email de test envoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors du test SMTP:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du mail de test' 
    });
  }
});

export default router; 