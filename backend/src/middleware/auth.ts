import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔑 Auth Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Pas de token Bearer');
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token reçu:', token.substring(0, 20) + '...');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      console.log('✅ Token vérifié:', decoded);
      next();
    } catch (error) {
      console.log('❌ Token invalide:', error);
      return res.status(401).json({ message: 'Token invalide' });
    }
  } catch (error) {
    console.error('🔴 Erreur d\'authentification:', error);
    return res.status(500).json({ message: 'Erreur d\'authentification' });
  }
}; 