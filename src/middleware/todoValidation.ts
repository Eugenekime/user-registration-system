import { body, query } from 'express-validator';

export const todoValidation = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Text is required and cannot be empty')
    .bail()
    .isString()
    .withMessage('Text must be a string')
    .isLength({ min: 3, max: 300 })
    .withMessage('Text must be between 3 and 300 characters'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  body('priority')
    .optional()
    .isString()
    .withMessage('Priority must be a string')
    .bail()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
];

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

  query('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be true or false')
    .toBoolean(),

  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium or high'),
];
