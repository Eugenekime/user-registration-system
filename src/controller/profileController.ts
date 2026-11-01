import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

import {
  getMyProfileService,
  updateMyProfileService,
  getPublicProfileService,
} from '../services/profileService.js';

export async function getMyProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError(
        'Authentication required',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }

    const profile = await getMyProfileService(req.user.sub);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMyProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError(
        'Authentication required',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }

    const { firstName, lastName, bio } = req.body;

    const updatedProfile = await updateMyProfileService(req.user.sub, {
      firstName,
      lastName,
      bio,
    });

    return res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicProfileController(
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

    const profile = await getPublicProfileService(req.params.id);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
}
