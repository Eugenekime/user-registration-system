import type { Request, Response, NextFunction } from 'express';
import {
  getAllUsersService,
  getUserByIdService,
  patchUserByIdService,
} from '../services/adminService.js';
import { AppError } from '../utils/AppError.js';

export async function getAllUsersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = (req.query.page as number | undefined) ?? 1;
    const limit = (req.query.limit as number | undefined) ?? 10;
    const result = await getAllUsersService(page, limit);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
    }
    const user = await getUserByIdService(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function patchUserByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const { username, profile } = req.body;

  try {
    if (typeof id !== 'string') {
      throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
    }
    const updatedUser = await patchUserByIdService(id, {
      username,
      profile,
    });
    if (!updatedUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
}
