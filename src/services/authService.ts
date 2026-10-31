import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import RefreshToken from '../models/RefreshToken.js';
import { createHash, randomBytes } from 'node:crypto';
import { sendVerificationEmail } from '../utils/emailService.js';
import { AppError } from '../utils/AppError.js';

export async function registrationUser(body: {
  email: string;
  username: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    bio?: string;
  };
}) {
  const existedUser = await User.findOne({
    email: body.email,
  });
  if (existedUser) {
    throw new AppError('Email already exists', 409, 'EMAIL_ALREADY_EXISTS');
  }
  const hashedPassword = await bcrypt.hash(body.password, 12);

  const verificationToken = randomBytes(32).toString('hex');

  const verificationTokenHash = createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  const expires = new Date(Date.now() + 15 * 60 * 1000);

  const user = await User.create({
    email: body.email,
    username: body.username,
    passwordHash: hashedPassword,
    emailVerificationTokenHash: verificationTokenHash,
    emailVerificationExpires: expires,
    isEmailVerified: false,
    ...(body.profile && { profile: body.profile }),
  });

  const verificationUrl = new URL('/verify-email', 'http://localhost:5173');

  verificationUrl.searchParams.set('token', verificationToken);
  await sendVerificationEmail(user.email, verificationUrl.toString());
  return user;
}

export async function verifyEmail(token: string) {
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
    isEmailVerified: false,
  }).select('+emailVerificationTokenHash +emailVerificationExpires');

  if (!user) {
    throw new AppError(
      'Invalid or expired verification link',
      400,
      'INVALID_OR_EXPIRED_VERIFICATION_TOKEN'
    );
  }
  await User.updateOne(
    { _id: user._id },
    {
      $set: { isEmailVerified: true },
      $unset: {
        emailVerificationTokenHash: 1,
        emailVerificationExpires: 1,
      },
    }
  );

  return { success: true };
}

export async function resendVerificationEmail(email: string) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (user.isEmailVerified) {
    throw new AppError('Email already verified', 400, 'EMAIL_ALREADY_VERIFIED');
  }

  const verificationToken = randomBytes(32).toString('hex');

  const verificationTokenHash = createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  const expires = new Date(Date.now() + 15 * 60 * 1000);

  user.emailVerificationTokenHash = verificationTokenHash;
  user.emailVerificationExpires = expires;

  await user.save();

  const verificationUrl = new URL('/verify-email', 'http://localhost:5173');

  verificationUrl.searchParams.set('token', verificationToken);

  await sendVerificationEmail(user.email, verificationUrl.toString());
}

export async function loginService(email: string, password: string) {
  const user = await User.findOne({ email: email }).select('+passwordHash');

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    const remainingMs = user.lockUntil.getTime() - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    throw new AppError(
      `Too many failed login attempts. Please try again in ${remainingMinutes} minutes`,
      429,
      'TOO_MANY_LOGIN_ATTEMPTS'
    );
  }
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    user.failedLoginAttempts++;

    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await user.save();

    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isEmailVerified) {
    throw new AppError(
      'Please verify your email first',
      403,
      'EMAIL_NOT_VERIFIED'
    );
  }

  user.lockUntil = null;
  user.failedLoginAttempts = 0;
  await user.save();

  const accessToken = jwt.sign(
    {
      sub: user._id.toString(),
      type: 'access',
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
    },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    {
      sub: user._id.toString(),
      type: 'refresh',
    },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  const refreshTokenHash = createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  await RefreshToken.create({
    userId: user._id,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles,
    },
  };
}
export async function logoutService(refreshToken: string) {
  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch {
    return true;
  }

  if (
    typeof payload === 'string' ||
    payload.type !== 'refresh' ||
    typeof payload.sub !== 'string'
  ) {
    return true;
  }

  const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

  await RefreshToken.deleteOne({
    tokenHash,
    userId: payload.sub,
  });
  return true;
}

export async function refreshService(refreshToken: string) {
  let payload: string | JwtPayload;

  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch {
    throw new AppError(
      'Invalid or expired refresh token',
      401,
      'INVALID_REFRESH_TOKEN'
    );
  }

  if (
    typeof payload === 'string' ||
    payload.type !== 'refresh' ||
    typeof payload.sub !== 'string'
  ) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

  const storedToken = await RefreshToken.findOne({
    tokenHash,
    userId: payload.sub,
    expiresAt: { $gt: new Date() },
  });

  if (!storedToken) {
    throw new AppError(
      'Invalid or expired refresh token',
      401,
      'INVALID_REFRESH_TOKEN'
    );
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new AppError(
      'User associated with refresh token was not found',
      401,
      'INVALID_REFRESH_TOKEN'
    );
  }

  const accessToken = jwt.sign(
    {
      sub: user._id.toString(),
      type: 'access',
      roles: user.roles,
    },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' }
  );

  await RefreshToken.deleteOne({ _id: storedToken._id });

  const newRefreshToken = jwt.sign(
    {
      sub: user._id.toString(),
      type: 'refresh',
    },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  await RefreshToken.create({
    userId: user._id,
    tokenHash: createHash('sha256').update(newRefreshToken).digest('hex'),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken: newRefreshToken };
}
