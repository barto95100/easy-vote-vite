import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validatePollCreation = [
  body('title')
    .exists().withMessage('Le titre est requis')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),

  body('options')
    .exists().withMessage('Les options sont requises')
    .isArray().withMessage('Les options doivent être un tableau')
    .custom((options) => {
      if (!Array.isArray(options)) return false;
      if (options.length < 2) {
        throw new Error('Au moins 2 options sont requises');
      }
      const validOptions = options.every(opt => 
        opt && 
        typeof opt === 'object' && 
        'text' in opt && 
        typeof opt.text === 'string' && 
        opt.text.trim().length > 0
      );
      if (!validOptions) {
        throw new Error('Chaque option doit avoir un texte valide');
      }
      return true;
    }),

  body('expiresAt')
    .exists().withMessage('La date d\'expiration est requise')
    .notEmpty().withMessage('La date d\'expiration est requise')
    .isISO8601().withMessage('Format de date invalide')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error('La date d\'expiration doit être dans le futur');
      }
      return true;
    }),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Données reçues dans la validation:', req.body);
      const formattedErrors = errors.array().reduce((acc: Record<string, string[]>, error) => {
        if (!acc[error.path]) {
          acc[error.path] = [];
        }
        if (!acc[error.path].includes(error.msg)) {
          acc[error.path].push(error.msg);
        }
        return acc;
      }, {});

      return res.status(400).json({
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateVote = [
  param('id').isUUID().withMessage('ID de sondage invalide'),
  body('optionId').isUUID().withMessage('ID d\'option invalide'),
  handleValidationErrors
];

export const validatePollAccess = [
  param('id').isUUID().withMessage('ID de sondage invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mot de passe invalide'),
  handleValidationErrors
];

// Middleware de gestion des erreurs de validation
function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
} 