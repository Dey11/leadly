import { Request, Response, NextFunction } from "express";
import { getRedis } from "./redis";

type RateLimitConfig = {
    windowMs: number;
    maxRequests: number;
    keyPrefix: string;
    message?: string;
};

export const rateLimitConfigs: Record<string, RateLimitConfig> = {
    register: { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: "rl:register", message: "Too many registration attempts. Try again in an hour." },
    login: { windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: "rl:login", message: "Too many login attempts. Try again in 15 minutes." },
    verifyEmail: { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "rl:verify", message: "Too many verification attempts. Try again in 15 minutes." },
    forgotPassword: { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: "rl:forgot", message: "Too many password reset requests. Try again in an hour." },
    resetPassword: { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "rl:reset", message: "Too many reset attempts. Try again in 15 minutes." },
    resendOtp: { windowMs: 5 * 60 * 1000, maxRequests: 2, keyPrefix: "rl:resend", message: "Please wait before requesting another code." },
};

export async function checkRateLimit(req: Request, action: keyof typeof rateLimitConfigs) {
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

export async function incrementRateLimit(req: Request, action: keyof typeof rateLimitConfigs) {
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
            res.setHeader("X-RateLimit-Remaining", Math.max(0, config.maxRequests - current));
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
