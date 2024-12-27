import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const limiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard'
  }
}); 