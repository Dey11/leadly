import { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  const { method, url } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    // Log level 'http' is not standard in winston's npm levels, but 'info' is fine.
    // If you explicitly want 'http' level, ensure it's in your levels config.
    // For now we use info/warn/error based on status.

    let level = "info";
    if (statusCode >= 500) level = "error";
    else if (statusCode >= 400) level = "warn";

    logger.log(level, `${method} ${url} ${statusCode} ${duration}ms`, {
      method,
      url,
      statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  });

  next();
};
