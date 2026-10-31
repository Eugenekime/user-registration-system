import { body, query } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new AppError(
        errors
          .array()
          .map((error) => error.msg)
          .join(', '),
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  return next();
}
export const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

export const patchUserValidation = [
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .bail()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .bail()
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      'Username can only contain letters, numbers, underscores, dots, and hyphens'
    ),
  body('profile')
    .optional()
    .isObject({ strict: true })
    .withMessage('Profile must be an object'),

  body('profile.firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .bail()
    .matches(/^[\p{L}\p{M} '-]+$/u)
    .withMessage(
      'First name can only contain letters, spaces, apostrophes, and hyphens'
    ),

  body('profile.lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .bail()
    .matches(/^[\p{L}\p{M} '-]+$/u)
    .withMessage(
      'Last name can only contain letters, spaces, apostrophes, and hyphens'
    ),

  body('profile.bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .bail()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Bio must be no more than 300 characters'),
];
