import { z } from 'zod';
import { sendData } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import { createAttemptLimiter } from '../utils/attemptLimiter.js';
import {
  registerUser,
  authenticateUser,
  recordLogin,
  requestPasswordReset,
  resetPassword,
} from '../services/auth.service.js';

const registerSchema = z.object({
  username: z
    .string({ error: 'Username is required' })
    .trim()
    .regex(/^[a-zA-Z0-9_.]{3,30}$/, 'Use 3 to 30 letters, numbers, dots or underscores'),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email address')),
  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

const loginSchema = z.object({
  identifier: z.string({ error: 'Enter your username or email' }).trim().min(1, 'Enter your username or email'),
  password: z.string({ error: 'Enter your password' }).min(1, 'Enter your password'),
});

function parse(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (result.success) return result.data;

  const details = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? 'form');
    details[field] ??= issue.message;
  }
  throw new AppError('Please check the highlighted fields', 400, 'VALIDATION_ERROR', details);
}

const forgotPasswordSchema = z.object({
  email: z.string({ error: 'Email is required' }).trim().pipe(z.email('Enter a valid email address')),
});

const resetPasswordSchema = z.object({
  token: z.string({ error: 'Reset link is invalid' }).min(1, 'Reset link is invalid'),
  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

// Limit *failed* sign-ins: per account+IP (guessing one password list) and per
// IP overall (spraying many usernames).
const perAccount = createAttemptLimiter({ max: 8, windowMs: 15 * 60 * 1000 });
const perIp = createAttemptLimiter({ max: 40, windowMs: 15 * 60 * 1000 });

// Limit reset-link *requests* (not failures) so it can't be used to spam
// someone's inbox or hammer the dummy email "service".
const forgotPasswordLimiter = createAttemptLimiter({ max: 3, windowMs: 60 * 60 * 1000 });

// passport 0.7 renews the session id here, which prevents session fixation.
const startSession = (req, user) =>
  new Promise((resolve, reject) => req.login(user, (err) => (err ? reject(err) : resolve())));

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(parse(registerSchema, req.body));
    await recordLogin(user);
    await startSession(req, user);
    sendData(res, user, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const credentials = parse(loginSchema, req.body);
    const accountKey = `${req.ip}:${credentials.identifier.toLowerCase()}`;

    if (perAccount.isBlocked(accountKey) || perIp.isBlocked(req.ip)) {
      throw new AppError('Too many failed attempts. Please try again in 15 minutes.', 429, 'TOO_MANY_ATTEMPTS');
    }

    let user;
    try {
      user = await authenticateUser(credentials);
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS') {
        perAccount.fail(accountKey);
        perIp.fail(req.ip);
      }
      throw err;
    }

    perAccount.reset(accountKey);
    await recordLogin(user);
    await startSession(req, user);
    sendData(res, user);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = parse(forgotPasswordSchema, req.body);
    const key = `${req.ip}:${email.toLowerCase()}`;

    if (forgotPasswordLimiter.isBlocked(key)) {
      throw new AppError('Too many reset requests. Please try again later.', 429, 'TOO_MANY_ATTEMPTS');
    }
    forgotPasswordLimiter.fail(key);

    await requestPasswordReset(email);
    // Same response whether or not the email is registered — see
    // requestPasswordReset's comment for why.
    sendData(res, { message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordHandler = async (req, res, next) => {
  try {
    const { token, password } = parse(resetPasswordSchema, req.body);
    const user = await resetPassword({ token, password });
    await startSession(req, user);
    sendData(res, user);
  } catch (err) {
    next(err);
  }
};
