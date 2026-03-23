const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Different rate limiters for different routes
const rateLimiters = {
  // Auth routes - stricter limits
  auth: createRateLimiter(15 * 60 * 1000, 5, 'Too many login attempts, please try again later.'),

  // API routes - standard limits
  api: createRateLimiter(15 * 60 * 1000, 100),

  // Upload routes - stricter limits
  upload: createRateLimiter(60 * 60 * 1000, 10, 'Upload limit reached, please try again later.'),

  // Public routes - generous limits
  public: createRateLimiter(15 * 60 * 1000, 200)
};

module.exports = rateLimiters;