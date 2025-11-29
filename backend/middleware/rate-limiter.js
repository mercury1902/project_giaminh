import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  },
  keyGenerator: (req) => {
    // Use IP address as key
    return req.ip;
  }
});

// Stricter Wikipedia API limiter
export const wikipediaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Max 50 requests per 15 minutes
  message: 'Quá nhiều yêu cầu API Wikipedia, vui lòng thử lại sau.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});
