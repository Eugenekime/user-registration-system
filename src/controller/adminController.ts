import type { Request, Response, NextFunction } from 'express';
import {
  getAllUsersService,
  getUserByIdService,
  patchUserByIdService,
  putUserRoleService,
  putUserStatusService,
  getUserTodosService,
} from '../services/adminService.js';
import { getStatisticsService } from '../services/getStatisticsService.js';
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

export async function putUserRoleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError(
        'Invalid or expired access token',
        401,
        'INVALID_ACCESS_TOKEN'
      );
    }
    if (!req.params.id) {
      throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
    }

    if (typeof req.params.id !== 'string') {
      throw new AppError(
        'User ID must be string',
        400,
        'USER_ID_MUST_BE_STRING'
      );
    }

    if (!req.body || typeof req.body !== 'object') {
      throw new AppError('Invalid request body', 400, 'INVALID_BODY');
    }

    const { role } = req.body;

    if (role !== 'admin' && role !== 'user') {
      throw new AppError('Role must be admin or user', 400, 'INVALID_ROLE');
    }

    const updatedUser = await putUserRoleService(
      req.params.id,
      role,
      req.user.sub
    );
    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
}

export async function putUserStatusController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError(
        'Invalid or expired access token',
        401,
        'INVALID_ACCESS_TOKEN'
      );
    }
    if (!req.params.id) {
      throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
    }

    if (typeof req.params.id !== 'string') {
      throw new AppError(
        'User ID must be string',
        400,
        'USER_ID_MUST_BE_STRING'
      );
    }
    const { isActive } = req.body;

    const updatedUser = await putUserStatusService(
      req.params.id,
      isActive,
      req.user.sub
    );

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getStatisticsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const statistics = await getStatisticsService();

    return res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserTodosController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.params.id) {
      throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
    }

    if (typeof req.params.id !== 'string') {
      throw new AppError(
        'User ID must be string',
        400,
        'USER_ID_MUST_BE_STRING'
      );
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    const result = await getUserTodosService(req.params.id, page, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}
