import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// Passwords are hashed with scrypt (built into Node, so no extra dependency).
// The stored value carries its own parameters, so they can be raised later
// without breaking existing users: scrypt$N$r$p$salt$hash
const scryptAsync = promisify(scrypt);
const N = 2 ** 15;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 128 * N * R * 2;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEY_LENGTH, { N, r: R, p: P, maxmem: MAX_MEMORY });
  return ['scrypt', N, R, P, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password, stored) {
  const [scheme, n, r, p, saltB64, keyB64] = String(stored ?? '').split('$');
  if (scheme !== 'scrypt' || !saltB64 || !keyB64) return false;

  const expected = Buffer.from(keyB64, 'base64');
  const actual = await scryptAsync(password, Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: MAX_MEMORY,
  });
  return timingSafeEqual(actual, expected);
}
