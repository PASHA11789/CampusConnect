import rateLimit from "express-rate-limit";

/**
 * Global API rate limiter — 100 requests per 15 minutes per IP.
 * Provides baseline DDoS protection for all endpoints.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Auth rate limiter — 40 requests per 15 minutes per IP.
 * Prevents brute-force login and registration spam while avoiding locking out legitimate users.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  skipSuccessfulRequests: true, // Do not count successful logins toward the limit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

/**
 * Search rate limiter — 30 requests per minute per IP.
 * Prevents abuse of regex-based search endpoints.
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many search requests. Please slow down.",
  },
});
