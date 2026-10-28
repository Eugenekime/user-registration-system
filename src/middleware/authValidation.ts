import { body } from 'express-validator';
import type { Response, Request, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import 'dotenv/config';

export const registrationValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isString()
    .withMessage('Email must be a string')
    .bail()
    .isEmail()
    .withMessage('Invalid email format')
    .bail()
    .normalizeEmail(),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .bail()
    .isString()
    .withMessage('Username must be a string')
    .bail()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .bail()
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      'Username can only contain letters, numbers, underscores, dots, and hyphens'
    ),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isString()
    .withMessage('Password must be a string')
    .bail()
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .bail()
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .bail()
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .bail()
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .bail()
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character'),

  body('profile').isObject().withMessage('Profile must be an object'),

  body('profile.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .bail()
    .isString()
    .withMessage('First name must be a string')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .bail()
    .matches(/^[\p{L}\p{M} '-]+$/u)
    .withMessage(
      'First name can only contain letters, spaces, apostrophes, and hyphens'
    ),

  body('profile.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .bail()
    .isString()
    .withMessage('Last name must be a string')
    .bail()
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
    .withMessage('Bio must be less then 300 characters'),
];

export const loginValidator = [
  body('email')
    .isString()
    .withMessage('Email must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Invalid email format')
    .bail()
    .normalizeEmail(),

  body('password')
    .isString()
    .withMessage('Password must be a string')
    .bail()
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .bail()
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .bail()
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .bail()
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .bail()
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character'),
];

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null)
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });

  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      payload.type !== 'access'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
      });
    }

    req.user = {
      sub: payload.sub,
      type: payload.type,
      roles: Array.isArray(payload.roles)
        ? payload.roles.filter(
            (role): role is string => typeof role === 'string'
          )
        : [],
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
}
