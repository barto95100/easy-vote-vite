import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

export const config = {
  // Serveur
  PORT: Number(process.env.PORT) || 3001,
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Base de données
  DATABASE_URL: process.env.DATABASE_URL,

  // Sécurité
  JWT: {
    SECRET: process.env.JWT_SECRET || 'default-secret-key',
    EXPIRATION: '24h'
  },
  
  RATE_LIMIT: {
    WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15000,
    MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // SMTP
  SMTP: {
    HOST: process.env.SMTP_HOST,
    PORT: Number(process.env.SMTP_PORT) || 25,
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASS,
    FROM: process.env.SMTP_FROM,
    SECURE: process.env.SMTP_SECURE === 'true'
  },

  // Nettoyage
  CLEANUP: {
    AUTO_DELETE_DAYS: Number(process.env.AUTO_DELETE_DAYS) || 30
  },

  // Admin
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD || 'admin123'
};

// Validation de la configuration
const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variable d'environnement requise manquante: ${envVar}`);
  }
} 