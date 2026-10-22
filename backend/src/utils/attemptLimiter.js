// In-memory limiter for failed sign-in attempts. Good enough for a single
// server process; move it to Redis if the API is ever run on several instances.
export function createAttemptLimiter({ max, windowMs }) {
  const attempts = new Map(); // key -> { count, resetAt }

  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of attempts) if (entry.resetAt <= now) attempts.delete(key);
  }, windowMs);
  timer.unref();

  const live = (key) => {
    const entry = attempts.get(key);
    return entry && entry.resetAt > Date.now() ? entry : undefined;
  };

  return {
    isBlocked: (key) => (live(key)?.count ?? 0) >= max,
    fail(key) {
      const entry = live(key);
      if (entry) entry.count += 1;
      else attempts.set(key, { count: 1, resetAt: Date.now() + windowMs });
    },
    reset: (key) => attempts.delete(key),
  };
}
