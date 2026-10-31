import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getUserService, patchUserService } from '../services/userService.js';
import { AppError } from '../utils/AppError.js';

export async function getUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    throw new AppError(
      'Invalid or expired access token',
      401,
      'INVALID_ACCESS_TOKEN'
    );
  }
  const { sub } = req.user;

  try {
    const user = await getUserService(sub);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function patchUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    throw new AppError(
      'Invalid or expired access token',
      401,
      'INVALID_ACCESS_TOKEN'
    );
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
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
}
