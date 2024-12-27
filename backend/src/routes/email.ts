import { Router } from 'express';
import { EmailService } from '../services/email';

const router = Router();

router.post('/test', async (req, res) => {
  try {
    // Tester la connexion SMTP
    const isConfigValid = await EmailService.testConnection();
    if (!isConfigValid) {
      return res.status(500).json({
        success: false,
        message: 'La configuration SMTP est invalide'
      });
    }

    // Envoyer un email de test
    const result = await EmailService.sendTestEmail();
    
    res.json({
      success: true,
      message: 'Email de test envoyé avec succès',
      details: result
    });
  } catch (error) {
    console.error('Erreur lors du test email:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du mail de test'
    });
  }
});

export default router; 