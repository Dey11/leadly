import { Request, Response, NextFunction } from "express";
import { env } from "../env";
import { getRedis } from "./redis";

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  message?: string;
};

export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  register: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    keyPrefix: "rl:register",
    message: "Too many registration attempts. Try again in an hour.",
  },
  login: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    keyPrefix: "rl:login",
    message: "Too many login attempts. Try again in 15 minutes.",
  },
  verifyEmail: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    keyPrefix: "rl:verify",
    message: "Too many verification attempts. Try again in 15 minutes.",
  },
  forgotPassword: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    keyPrefix: "rl:forgot",
    message: "Too many password reset requests. Try again in an hour.",
  },
  resetPassword: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    keyPrefix: "rl:reset",
    message: "Too many reset attempts. Try again in 15 minutes.",
  },
  resendOtp: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 2,
    keyPrefix: "rl:resend",
    message: "Please wait before requesting another code.",
  },
};

export async function checkRateLimit(
  req: Request,
  action: keyof typeof rateLimitConfigs,
) {
  if (env.NODE_ENV === "development") {
    const config = rateLimitConfigs[action];
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now(),
      exceeded: false,
      error: "",
      retryAfter: 0,
    };
  }
  const config = rateLimitConfigs[action];
  const redis = getRedis();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const email = req.body?.email?.toLowerCase() || "";
  const key = `${config.keyPrefix}:${ip}:${email}`;

  const currentStr = await redis.get(key);
  const current = currentStr ? parseInt(currentStr, 10) : 0;
  const ttl = await redis.pttl(key);

  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - current),
    reset: Math.ceil(Date.now() + (ttl > 0 ? ttl : 0)),
    exceeded: current >= config.maxRequests,
    error: config.message || "Too many requests. Please try again later.",
    retryAfter: Math.ceil((ttl > 0 ? ttl : 0) / 1000),
  };
}

export async function incrementRateLimit(
  req: Request,
  action: keyof typeof rateLimitConfigs,
) {
  if (env.NODE_ENV === "development") {
    return 0;
  }
  const config = rateLimitConfigs[action];
  const redis = getRedis();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const email = req.body?.email?.toLowerCase() || "";
  const key = `${config.keyPrefix}:${ip}:${email}`;

  const current = await redis.incr(key);
  if (current === 1) {
    await redis.pexpire(key, config.windowMs);
  }
  return current;
}

export function rateLimit(action: keyof typeof rateLimitConfigs) {
  const config = rateLimitConfigs[action];

  return async (req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === "development") {
      return next();
    }
    try {
      const redis = getRedis();
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const email = req.body?.email?.toLowerCase() || "";
      const key = `${config.keyPrefix}:${ip}:${email}`;

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.pexpire(key, config.windowMs);
      }

      const ttl = await redis.pttl(key);
      res.setHeader("X-RateLimit-Limit", config.maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, config.maxRequests - current),
      );
      res.setHeader("X-RateLimit-Reset", Math.ceil(Date.now() + ttl));

      if (current > config.maxRequests) {
        return res.status(429).json({
          error: config.message || "Too many requests. Please try again later.",
          retryAfter: Math.ceil(ttl / 1000),
        });
      }

      next();
    } catch (error) {
      console.error("Rate limit error:", error);
      next();
    }
  };
}

export type UserRateLimitAction =
  | "read"
  | "write"
  | "delete"
  | "ai"
  | "billing";

type UserRateLimitConfig = {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  message: string;
};

export const userRateLimitConfigs: Record<
  UserRateLimitAction,
  UserRateLimitConfig
> = {
  read: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: "rl:user:read",
    message: "Too many requests. Please slow down.",
  },
  write: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    keyPrefix: "rl:user:write",
    message: "Too many write requests. Please slow down.",
  },
  delete: {
    windowMs: 60 * 1000,
    maxRequests: 20,
    keyPrefix: "rl:user:delete",
    message: "Too many delete requests. Please slow down.",
  },
  ai: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    keyPrefix: "rl:user:ai",
    message: "AI rate limit exceeded. Please wait before trying again.",
  },
  billing: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: "rl:user:billing",
    message: "Too many billing requests. Please slow down.",
  },
};

export function userRateLimit(action: UserRateLimitAction) {
  const config = userRateLimitConfigs[action];

  return async (req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === "development") {
      return next();
    }
    try {
      const userId = req.userId;
      if (!userId) {
        return next();
      }

      const redis = getRedis();
      const key = `${config.keyPrefix}:${userId}`;

      const luaScript = `
        local current = redis.call("INCR", KEYS[1])
        if current == 1 then
          redis.call("PEXPIRE", KEYS[1], ARGV[1])
        end
        return current
      `;

      const current = (await redis.eval(
        luaScript,
        1,
        key,
        config.windowMs,
      )) as number;
      const ttl = await redis.pttl(key);
      res.setHeader("X-RateLimit-Limit", config.maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, config.maxRequests - current),
      );
      res.setHeader("X-RateLimit-Reset", Math.ceil(Date.now() + ttl));

      if (current > config.maxRequests) {
        return res.status(429).json({
          error: config.message,
          retryAfter: Math.ceil(ttl / 1000),
        });
      }

      next();
    } catch (error) {
      console.error("User rate limit error:", error);
      next();
    }
  };
}
