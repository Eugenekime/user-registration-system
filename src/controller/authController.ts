import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  loginService,
  registrationUser,
  verifyEmail,
  refreshService,
  resendVerificationEmail,
  logoutService,
} from '../services/authService.js';
import { AppError } from '../utils/AppError.js';

export async function registrationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
    return next(error);
  }
}

export async function verifyController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.query.token;

  if (typeof token !== 'string' || !token) {
    return next(
      new AppError(
        'Verification token is required',
        400,
        'VERIFICATION_TOKEN_REQUIRED'
      )
    );
  }

  try {
    const result = await verifyEmail(token);
    return res.status(200).json({
      ...result,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);

    return next(error);
  }
}

export async function resendVerificationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;

  if (typeof email !== 'string' || !email) {
    return next(new AppError('Email is required', 400, 'EMAIL_REQUIRED'));
  }

  try {
    await resendVerificationEmail(email);

    return res.status(200).json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    return next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;
  try {
    const { accessToken, refreshToken, user } = await loginService(
      email,
      password
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken,
        user,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    return next(error);
  }
}

export async function refreshTokenController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const refreshToken = req.cookies?.refreshToken;

  if (typeof refreshToken !== 'string' || !refreshToken) {
    return next(
      new AppError('Refresh token is missing', 401, 'INVALID_REFRESH_TOKEN')
    );
  }

  try {
    const tokens = await refreshService(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    if (
      error instanceof AppError &&
      error.errorCode === 'INVALID_REFRESH_TOKEN'
    ) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
      });
    }

    console.error('Refresh error:', error);

    return next(error);
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const refreshToken = req.cookies?.refreshToken;
  if (typeof refreshToken !== 'string' || !refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
  try {
    if (typeof refreshToken === 'string' && refreshToken) {
      await logoutService(refreshToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
    });

    return res.status(204).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return next(error);
  }
}
