import { body } from 'express-validator';

export const registrationValidator = [
  body('email')
    .isString()
    .withMessage('Email must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Invalid email format'),

  body('username')
    .isString()
    .withMessage('Username must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .bail()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),

  body('password')
    .isString()
    .withMessage('Password must be a string')
    .bail()
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters'),
  body('profile')
    .optional()
    .isObject()
    .withMessage('Profile must be an object'),

  body('profile.firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string')
    .bail()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters'),

  body('profile.lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string')
    .bail()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters'),
];
