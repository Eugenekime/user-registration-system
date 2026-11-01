import mongoose from 'mongoose';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export async function getMyProfileService(userId: string) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  const user = await User.findById(userId)
    .select('email username profile roles isEmailVerified isActive createdAt')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
}

export async function updateMyProfileService(
  userId: string,
  data: UpdateProfileData
) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...Object.fromEntries(
          Object.entries(data).map(([key, value]) => [`profile.${key}`, value])
        ),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select('username profile');

  if (!updatedUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return updatedUser;
}

export async function getPublicProfileService(userId: string) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  const user = await User.findById(userId)
    .select('username profile.firstName profile.lastName profile.bio createdAt')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
}
