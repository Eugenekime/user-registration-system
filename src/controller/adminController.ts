import type { Request, Response, NextFunction } from 'express';
import {
  getAllUsersService,
  getUserByIdService,
  patchUserByIdService,
} from '../services/adminService.js';

export async function getAllUsersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
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
  const { id } = req.params;
  if (typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID',
    });
  }
  try {
    const user = await getUserByIdService(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
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
  if (typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID',
    });
  }

  try {
    const updatedUser = await patchUserByIdService(id, {
      username,
      profile,
    });
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'No fields provided for update'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
}
