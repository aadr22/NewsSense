const rateLimit = require('express-rate-limit');

/**
 * Middleware to enforce API rate limits.
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // Limit each IP to 5 requests per minute
  message: {
    status: 429,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

module.exports = apiLimiter;
