import User from '../models/User.js';

interface PatchBody {
  username: string;
  profile: { firstName: string; lastName: string; bio?: string };
}

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

export async function pathUserService(userId: string, body: PatchBody) {
  if (typeof userId !== 'string' || !userId) {
    throw new Error('Invalid or expired access token');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }
}
