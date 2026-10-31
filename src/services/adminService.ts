import User from '../models/User.js';
import type { PatchBody } from '../types/user.js';
import { AppError } from '../utils/AppError.js';

export async function getAllUsersService(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [users, totalUsers] = await Promise.all([
    User.find()
      .select('email username profile roles isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(),
  ]);
  return {
    data: {
      users,
      page,
      limit,
      totalUsers,
    },
  };
}

export async function getUserByIdService(userId: string) {
  if (!User.db.base.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }
  const user = await User.findById(userId).select(
    '-passwordHash -refreshTokenJti'
  );

  if (!user) {
    return null;
  }

  return user;
}

export async function patchUserByIdService(userId: string, body: PatchBody) {
  if (!User.db.base.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
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
  ).select('-passwordHash -refreshTokenJti');

  if (!user) {
    return null;
  }

  return user;
}
