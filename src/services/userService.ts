import User from '../models/User.js';
import mongoose from 'mongoose';
import type { PatchBody } from '../types/user.js';
import { AppError } from '../utils/AppError.js';

export async function getUserService(userId: string) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 401, 'INVALID_ACCESS_TOKEN');
  }
  const user = await User.findById(userId).select('username profile');

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return {
    username: user.username,
    profile: user.profile,
  };
}

export async function patchUserService(userId: string, body: PatchBody) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 401, 'INVALID_ACCESS_TOKEN');
  }

  const update: Record<string, unknown> = {};

  if (body.username !== undefined) {
    update.username = body.username;
  }

  if (body.profile?.firstName !== undefined) {
    update['profile.firstName'] = body.profile.firstName;
  }

  if (body.profile?.lastName !== undefined) {
    update['profile.lastName'] = body.profile.lastName;
  }

  if (body.profile?.bio !== undefined) {
    update['profile.bio'] = body.profile.bio;
  }
  if (Object.keys(update).length === 0) {
    throw new AppError(
      'No fields provided for update',
      400,
      'NO_FIELDS_TO_UPDATE'
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: update },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return {
    username: user.username,
    profile: user.profile,
  };
}
