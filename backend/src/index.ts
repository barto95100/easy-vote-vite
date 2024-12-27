import express from 'express';
import cors from 'cors';
import { config } from './config';
import pollsRouter from './routes/polls';
import emailRouter from './routes/email';
import adminRouter from './routes/admin';
import { configureSecurityMiddleware } from './middleware/security';
import { CleanupService } from './services/cleanup';
import { AdminService } from './services/admin';
import { initWebSocket } from './websocket';
import { createServer } from 'http';
import { errorHandler } from './middleware/errorHandler';
import os from 'os';

const app = express();
const server = createServer(app);

// Configurer la confiance dans le proxy pour obtenir la vraie IP
app.set('trust proxy', true);

// Initialiser WebSocket une seule fois
initWebSocket(server);

// Configuration CORS dynamique
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log des requêtes
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', req.body);
  }
  next();
});

// Middlewares de sécurité
configureSecurityMiddleware(app);

// Routes API
app.use('/polls', pollsRouter);
app.use('/email', emailRouter);
app.use('/admin', adminRouter);

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Fonction pour obtenir la vraie IP
const getRealIp = (req: Request): string => {
  const realIp = req.headers['x-real-ip'] as string;
  if (realIp) return realIp;

  const forwardedFor = req.headers['x-forwarded-for'] as string;
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip;
};

// Démarrage du serveur
async function bootstrap() {
  try {
    await AdminService.initializeAdmin();
    CleanupService.startCleanupJob();
    
    const PORT = process.env.PORT || 3001;
    const HOST = process.env.HOST || '0.0.0.0';
    
    server.listen(PORT, HOST, () => {
      console.log(`🚀 Serveur démarré sur port ${PORT}`);
      console.log(`📝 API disponible sur http://${HOST}:${PORT}`);
      console.log(`🔌 WebSocket disponible sur ws://${HOST}:${PORT}/ws`);
      console.log(`👥 Origines CORS autorisées:`, allowedOrigins);
    });
  } catch (error) {
    console.error('Erreur au démarrage:', error);
    process.exit(1);
  }
}

bootstrap();
