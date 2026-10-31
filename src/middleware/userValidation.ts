import { body } from 'express-validator';

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
