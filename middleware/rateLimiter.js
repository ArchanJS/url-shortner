const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  });
};

const shortenLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many URL shortening requests, please try again after 15 minutes'
);

module.exports = { shortenLimiter };