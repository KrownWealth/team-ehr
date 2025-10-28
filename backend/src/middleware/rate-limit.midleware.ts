import { Request, Response, NextFunction } from "express";
import { config } from "../config/env";
import logger from "../utils/logger.utils";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.ip || "unknown";
  const now = Date.now();
  const windowMs = config.rateLimit.windowMs;
  const maxRequests = config.rateLimit.maxRequests;

  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return next();
  }

  store[key].count++;

  if (store[key].count > maxRequests) {
    logger.warn(`Rate limit exceeded for IP: ${key}`);
    return res.status(429).json({
      status: "error",
      message: "Too many requests, please try again later",
      retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
    });
  }

  next();
};
