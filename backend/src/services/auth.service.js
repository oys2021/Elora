import { randomBytes, createHash } from 'node:crypto';
import { fn, col, where as sqlWhere, Op, UniqueConstraintError } from 'sequelize';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { sendPasswordResetEmail } from './dummyEmail.service.js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

const emailMatches = (email) => sqlWhere(fn('lower', col('email')), email.toLowerCase());

// Verified against when the account doesn't exist, so a wrong username takes
// as long as a wrong password and can't be told apart by timing.
const dummyHash = hashPassword('not-a-real-password');

export const registerUser = async ({ username, email, password }) => {
  const usernameKey = username.toLowerCase();

  if (await User.findOne({ where: { username: usernameKey } })) {
    throw new AppError('That username is already taken', 409, 'USERNAME_TAKEN', {
      username: 'That username is already taken',
    });
  }
  if (await User.findOne({ where: emailMatches(email) })) {
    throw new AppError('An account with that email already exists', 409, 'EMAIL_TAKEN', {
      email: 'An account with that email already exists',
    });
  }

  try {
    return await User.create({
      username: usernameKey,
      name: username, // shown in the UI with the capitalisation they chose
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
    });
  } catch (err) {
    // Two people registering the same name at the same moment.
    if (err instanceof UniqueConstraintError) {
      throw new AppError('That username or email is already in use', 409, 'ACCOUNT_EXISTS');
    }
    throw err;
  }
};

// Called after every successful sign-in / sign-up; feeds the admin Users page.
export const recordLogin = (user) => user.update({ lastLoginAt: new Date() });

export const authenticateUser = async ({ identifier, password }) => {
  const id = identifier.trim().toLowerCase();
  const user = await User.findOne({
    where: id.includes('@') ? emailMatches(id) : { username: id },
  });

  const passwordOk = await verifyPassword(password, user?.passwordHash ?? (await dummyHash));
  if (!user || !user.passwordHash || !passwordOk) {
    // Same message whether the account or the password was wrong.
    throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
  }
  return user;
};

// Always behaves the same whether or not the email is registered, so this
// can't be used to find out which emails have accounts. This also works for
// a Google-only account (no password yet) — the link lets it set one and
// start logging in with a password too.
export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ where: emailMatches(email.trim()) });
  if (!user) return;

  const token = randomBytes(32).toString('hex');
  await user.update({
    resetPasswordTokenHash: hashToken(token),
    resetPasswordExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  await sendPasswordResetEmail({ to: user.email, resetUrl: `${frontendUrl}/reset-password?token=${token}` });
};

export const resetPassword = async ({ token, password }) => {
  const user = await User.findOne({
    where: { resetPasswordTokenHash: hashToken(token), resetPasswordExpiresAt: { [Op.gt]: new Date() } },
  });
  if (!user) {
    throw new AppError('This reset link is invalid or has expired', 400, 'INVALID_RESET_TOKEN');
  }

  await user.update({
    passwordHash: await hashPassword(password),
    resetPasswordTokenHash: null,
    resetPasswordExpiresAt: null,
  });
  return user;
};
