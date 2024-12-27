import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export class AdminService {
  static async initializeAdmin() {
    try {
      const admin = await prisma.adminSettings.findUnique({
        where: { id: 'default' }
      });

      if (!admin) {
        const hashedPassword = await bcrypt.hash(process.env.INITIAL_ADMIN_PASSWORD || 'admin123', 10);
        await prisma.adminSettings.create({
          data: {
            id: 'default',
            adminPassword: hashedPassword,
            smtpHost: process.env.SMTP_HOST || '',
            smtpPort: parseInt(process.env.SMTP_PORT || '587'),
            smtpUser: process.env.SMTP_USER || '',
            smtpPass: process.env.SMTP_PASS || '',
            smtpFrom: process.env.SMTP_FROM || '',
            smtpSecure: process.env.SMTP_SECURE === 'true'
          }
        });
        console.log('✅ Compte admin initialisé avec la configuration par défaut');
      }

      // Afficher la configuration actuelle au démarrage
      const currentConfig = await this.getConfig();
      console.log(' Configuration SMTP actuelle:', {
        smtp: {
          host: currentConfig?.smtp?.host,
          port: currentConfig?.smtp?.port,
          user: currentConfig?.smtp?.user,
          from: currentConfig?.smtp?.from,
          secure: currentConfig?.smtp?.secure
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation admin:', error);
      throw error;
    }
  }

  static async login(password: string): Promise<string | null> {
    try {
      const admin = await prisma.adminSettings.findUnique({
        where: { id: 'default' }
      });

      if (!admin) {
        console.error('❌ Configuration admin non trouvée');
        return null;
      }

      const isValid = await bcrypt.compare(password, admin.adminPassword);
      if (!isValid) {
        console.log('❌ Tentative de connexion avec mot de passe invalide');
        return null;
      }

      const token = jwt.sign(
        { id: admin.id },
        config.JWT.SECRET,
        { expiresIn: config.JWT.EXPIRATION }
      );

      console.log('✅ Connexion admin réussie');
      return token;
    } catch (error) {
      console.error('❌ Erreur lors de la connexion admin:', error);
      throw error;
    }
  }

  static async getConfig() {
    try {
      console.log('🔍 Récupération de la configuration...');
      
      // Récupérer directement depuis les variables d'environnement
      const smtpConfig = {
        host: process.env.SMTP_HOST || '',
        port: process.env.SMTP_PORT || '',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.SMTP_FROM || '',
        secure: process.env.SMTP_SECURE === 'true'
      };

      console.log('✅ Configuration SMTP depuis .env:', smtpConfig);

      return {
        smtp: smtpConfig
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la configuration:', error);
      throw error;
    }
  }

  static async updateConfig(smtp?: any) {
    try {
      // Mettre à jour les variables d'environnement
      if (smtp) {
        process.env.SMTP_HOST = smtp.host;
        process.env.SMTP_PORT = smtp.port;
        process.env.SMTP_USER = smtp.user;
        process.env.SMTP_PASS = smtp.pass;
        process.env.SMTP_FROM = smtp.from;
        process.env.SMTP_SECURE = smtp.secure ? 'true' : 'false';
      }

      console.log('✅ Configuration mise à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la configuration:', error);
      throw error;
    }
  }
}