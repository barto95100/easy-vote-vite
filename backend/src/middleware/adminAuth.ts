import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { getAdminSettings } from '../services/init';

export const adminAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  try {
    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer') {
      return res.status(401).json({ message: 'Type d\'authentification invalide' });
    }

    const adminSettings = await getAdminSettings();
    if (!adminSettings) {
      return res.status(500).json({ message: 'Configuration admin non trouvée' });
    }

    const isValid = await bcrypt.compare(token, adminSettings.adminPassword);
    if (!isValid) {
      return res.status(401).json({ message: 'Mot de passe invalide' });
    }

    // Vérifier si c'est toujours le mot de passe par défaut
    const isDefaultPassword = await bcrypt.compare('admin', adminSettings.adminPassword);
    if (isDefaultPassword) {
      res.setHeader('X-Warning', 'default-password');
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Erreur d\'authentification' });
  }
}; 