import rateLimit from "express-rate-limit";

// 🌍 Global limiter (for all APIs)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500, // max 500 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

// 🔐 Strict limiter (for sensitive routes)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // only 50 requests
  message: {
    success: false,
    message: "Too many attempts, please slow down",
  },
});
