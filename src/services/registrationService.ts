import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { sendVerificationEmail } from '../utils/emailService.js';

export async function registrationUser(body: {
  email: string;
  username: string;
  password: string;
  profile?: {
    firstName: string;
    lastName: string;
  };
}) {
  const existedUser = await User.findOne({
    email: body.email,
  });
  if (existedUser) {
    throw new Error('Email already exists');
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
    password: hashedPassword,
    emailVerificationTokenHash: verificationTokenHash,
    emailVerificationExpires: expires,
    isEmailVerified: false,
    ...(body.profile && { profile: body.profile }),
  });

  const verificationUrl = new URL('/verify-email', 'http://localhost:5173');
  verificationUrl.searchParams.set('email', user.email);
  verificationUrl.searchParams.set('token', verificationToken);
  await sendVerificationEmail(user.email, verificationUrl.toString());
  return user;
}

export async function verifyEmail(email: string, token: string) {
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
    isEmailVerified: false,
  }).select('+emailVerificationTokenHash +emailVerificationExpires');

  if (!user) {
    throw new Error('Invalid or expired verification link');
  }
  user.isEmailVerified = true;
  user.set({
    emailVerificationTokenHash: undefined,
    emailVerificationExpires: undefined,
  });

  await user.save();

  return { email: user.email, isEmailVerified: user.isEmailVerified };
}
