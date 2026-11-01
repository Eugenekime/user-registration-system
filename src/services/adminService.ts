import User from '../models/User.js';
import Todo from '../models/Todo.js';
import mongoose from 'mongoose';
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
  if (!mongoose.isValidObjectId(userId)) {
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
  if (!mongoose.isValidObjectId(userId)) {
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

export async function putUserRoleService(
  userId: string,
  role: string,
  ownId: string
) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (userId === ownId) {
    throw new AppError(
      'You cannot change your own role',
      403,
      'CANNOT_CHANGE_OWN_ROLE'
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        roles: [role],
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select('email username roles');

  if (!updatedUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return updatedUser;
}

export async function putUserStatusService(
  userId: string,
  isActive: boolean,
  ownId: string
) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (userId === ownId) {
    throw new AppError(
      'You cannot change your own account status',
      403,
      'CANNOT_CHANGE_OWN_STATUS'
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: { isActive },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select('email username roles isActive');

  if (!updatedUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return updatedUser;
}

export async function getUserTodosService(
  userId: string,
  page: number,
  limit: number
) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  const userExists = await User.exists({ _id: userId });

  if (!userExists) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const skip = (page - 1) * limit;

  const [todos, totalTodos] = await Promise.all([
    Todo.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Todo.countDocuments({ userId }),
  ]);

  return {
    todos,
    pagination: {
      page,
      limit,
      totalTodos,
      totalPages: Math.ceil(totalTodos / limit),
    },
  };
}
