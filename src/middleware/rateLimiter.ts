import rateLimit from "express-rate-limit";
import { logger } from "@/lib/logger";

const rateLimitHandler = (req: any, res: any) => {
  logger.warn(
    {
      ip: req.ip,
      url: req.url,
      method: req.method,
    },
    "Rate limit exceeded"
  );

  res.status(429).json({
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  });
};

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});


export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: rateLimitHandler,
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: "Too many requests, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

export const checkoutRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  message: "Too many checkout requests, please wait before trying again",
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
