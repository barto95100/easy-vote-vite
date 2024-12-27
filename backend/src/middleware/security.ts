import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss';
import hpp from 'hpp';
import { Express, Request, Response, NextFunction } from 'express';
import { config } from '../config';

// Middleware XSS personnalisé
const xssMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = cleanXSS(req.body);
  }
  if (req.query) {
    req.query = cleanXSS(req.query);
  }
  next();
};

// Fonction récursive pour nettoyer les objets
const cleanXSS = (obj: any): any => {
  if (typeof obj !== 'object') {
    return typeof obj === 'string' ? xss(obj) : obj;
  }

  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map((item: any) => cleanXSS(item));
    } else if (typeof obj[key] === 'object') {
      obj[key] = cleanXSS(obj[key]);
    } else if (typeof obj[key] === 'string') {
      obj[key] = xss(obj[key]);
    }
  }

  return obj;
};

export const configureSecurityMiddleware = (app: Express) => {
  // Protection des en-têtes HTTP
  app.use(helmet());

  // Protection XSS
  app.use(xssMiddleware);

  // Protection contre la pollution des paramètres HTTP
  app.use(hpp());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Trop de requêtes, veuillez réessayer plus tard'
  });
  app.use('/api/', limiter);

  // Désactiver les en-têtes qui exposent des informations sur le serveur
  app.disable('x-powered-by');

  // Middleware de gestion des erreurs
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ 
      message: 'Une erreur est survenue sur le serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
};

export const corsOptions = {
  origin: config.FRONTEND_URL,
  credentials: true
}; 