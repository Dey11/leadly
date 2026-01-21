import type { Request, Response, NextFunction } from "express";
import { env } from "../env";

/**
 * Middleware to validate admin API key for sensitive endpoints.
 * Requires X-Admin-API-Key header to match ADMIN_API_KEY env variable.
 */
export const requireAdminApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers["x-admin-api-key"];

  if (!env.ADMIN_API_KEY) {
    return res.status(503).json({
      error: "Admin API key not configured on server",
    });
  }

  if (!apiKey || apiKey !== env.ADMIN_API_KEY) {
    return res.status(401).json({
      error: "Unauthorized - Invalid or missing admin API key",
    });
  }

  next();
};
