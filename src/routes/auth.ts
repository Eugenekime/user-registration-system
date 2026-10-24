import { Router, type Request, type Response } from 'express';
import { registrationValidator } from '../middleware/authValidation.js';
import { registrationLimiter } from '../middleware/registrationLimiter.js';
import { validationResult } from 'express-validator';
import {
  registrationUser,
  verifyEmail,
} from '../services/registrationService.js';

const router = Router();

router.post(
  '/register',
  registrationLimiter,
  registrationValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { email, password, username, profile } = req.body;
    try {
      const user = await registrationUser({
        email,
        password,
        username,
        profile,
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          profile: user.profile,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
    }
  }
);
router.post('/verify-email', async (req: Request, res: Response) => {
  const { email, token } = req.body;
  if (
    typeof email !== 'string' ||
    typeof token !== 'string' ||
    !email.trim() ||
    !token.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: 'Email and token are required',
    });
  }

  try {
    const result = await verifyEmail(email, token);
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Invalid or expired verification link'
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error('Email verification error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;
