import { config } from '../config';
import nodemailer from 'nodemailer';

// Remplacer par le résultat de la commande base64
const EASYVOTE_LOGO = 'https://vote.worldgeekwide.fr/easyvote.svg';  // À remplacer par votre URL


// Fonction pour décoder les entités HTML
const decodeHTMLEntities = (text: string) => {
  const decoded = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  return decoded;
};

// Fonction pour extraire l'email
const extractEmail = (fromString: string) => {
  const decoded = decodeHTMLEntities(fromString);
  
  if (decoded.includes('<')) {
    return {
      name: decoded.split('<')[0].trim(),
      address: decoded.split('<')[1].replace('>', '').trim()
    };
  }
  return decoded.trim();
};

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: config.SMTP.HOST,
    port: config.SMTP.PORT,
    secure: config.SMTP.SECURE,
    auth: config.SMTP.USER && config.SMTP.PASS ? {
      user: config.SMTP.USER,
      pass: config.SMTP.PASS
    } : false,
    ...(config.SMTP.SECURE ? {} : {
      ignoreTLS: true,
      requireTLS: false
    })
  });

  static async sendInvitation(to: string, pollTitle: string, pollId: string, token: string, description?: string) {
    console.log('📧 Envoi d\'email avec la configuration:', {
      host: config.SMTP.HOST,
      port: config.SMTP.PORT,
      secure: config.SMTP.SECURE,
      auth: config.SMTP.USER ? 'configured' : 'disabled',
      ...(config.SMTP.SECURE ? {} : {
        ignoreTLS: true,
        requireTLS: false
      })
    });

    const pollUrl = `${config.FRONTEND_URL}/polls/${pollId}?token=${token}`;
    console.log('📧 URLs utilisées:', {
      logo: EASYVOTE_LOGO,
      pollUrl
    });

    await this.transporter.sendMail({
      from: extractEmail(config.SMTP.FROM),
      to,
      subject: `🗳️ Invitation à participer au sondage : ${pollTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://vote.worldgeekwide.fr/easyvote.png" alt="EasyVote" style="height: 100px; width: auto;">
          </div>

          <!-- En-tête -->
          <div style="background-color: #4F46E5; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Invitation à un sondage</h1>
          </div>

          <!-- Corps -->
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">
              Vous avez été invité(e) à participer au sondage :
            </p>
            
            <div style="background-color: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4F46E5; margin: 0 0 10px 0; font-size: 20px;">${pollTitle}</h2>
              ${description ? `
                <p style="color: #4B5563; margin: 0; font-size: 16px; line-height: 1.6;">
                  ${description}
                </p>
              ` : ''}
            </div>

            <!-- Bouton de participation -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${pollUrl}" 
                 style="display: inline-block; background-color: #4F46E5; color: white; 
                        padding: 15px 30px; text-decoration: none; border-radius: 8px;
                        font-weight: bold; font-size: 16px; transition: background-color 0.3s;
                        box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
                Participer au sondage
              </a>
            </div>

            <!-- Note de sécurité -->
            <div style="border-left: 4px solid #FCD34D; padding: 15px; background-color: #FFFBEB; margin-top: 30px;">
              <p style="color: #92400E; margin: 0; font-size: 14px;">
                <strong>Note de sécurité :</strong> Ce lien est personnel et unique. Pour garantir l'intégrité du vote, merci de ne pas le partager.
              </p>
            </div>
          </div>

          <!-- Pied de page -->
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #6B7280; font-size: 14px; margin: 0;">
              Votre solution de sondage en ligne simple et sécurisée
            </p>
          </div>
        </div>
      `
    });
  }

  static async validateConfig() {
    try {
      await this.transporter.verify();
      console.log('✅ Configuration SMTP valide');
      return true;
    } catch (error) {
      console.error('❌ Configuration SMTP invalide:', error);
      return false;
    }
  }
} 