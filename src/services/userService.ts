import User from '../models/User.js';
import type { PatchBody } from '../types/user.js';

export async function getUserService(userId: string) {
  if (typeof userId !== 'string' || !userId) {
    throw new Error('Invalid or expired access token');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const allowedData = {
    username: user.username,
    profile: user.profile,
  };

  return allowedData;
}

export async function patchUserService(userId: string, body: PatchBody) {
  if (typeof userId !== 'string' || !userId) {
    throw new Error('Invalid or expired access token');
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
    throw new Error('No fields provided for update');
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
    throw new Error('User not found');
  }

  return user;
}
