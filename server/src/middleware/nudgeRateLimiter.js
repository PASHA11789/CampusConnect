// In-memory store for rate limiting nudge requests (keyed by User ID or IP)
const nudgeCache = new Map();

/**
 * Rate limiting middleware for POST /api/orders/:id/nudge
 * Restricts requests to 1 per 3 minutes (180,000 ms) per user/IP.
 */
export const nudgeRateLimiter = (req, res, next) => {
  const key = req.user ? req.user._id.toString() : req.ip;
  const now = Date.now();
  const COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes

  if (nudgeCache.has(key)) {
    const lastNudgeTime = nudgeCache.get(key);
    const timeElapsed = now - lastNudgeTime;

    if (timeElapsed < COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((COOLDOWN_MS - timeElapsed) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too Many Requests: You can only send a nudge once every 3 minutes. Please try again in ${remainingSeconds} seconds.`,
        retryAfterSeconds: remainingSeconds
      });
    }
  }

  // Update timestamp and proceed
  nudgeCache.set(key, now);
  next();
};

/**
 * Helper to clear the rate limit cache (useful for testing)
 */
export const _clearNudgeCache = () => {
  nudgeCache.clear();
};
