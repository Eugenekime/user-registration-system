import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getUserService, patchUserService } from '../services/userService.js';

export async function getUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
  const { sub } = req.user;

  try {
    const user = await getUserService(sub);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (
      error instanceof Error &&
      error.message === 'Invalid or expired access token'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

export async function patchUserController(
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
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
  const { username, profile } = req.body;
  const { sub } = req.user;
  try {
    const updatedUser = await patchUserService(sub, {
      username,
      profile,
    });
    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (
      error instanceof Error &&
      error.message === 'Invalid or expired access token'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (
      error instanceof Error &&
      error.message === 'No fields provided for update'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}
