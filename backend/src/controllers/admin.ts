import type { Request, Response } from "express";
import { sendAllLogsToDiscord } from "../services/logger.service";
import logger from "../lib/logger";

/**
 * POST /api/v1/admin/logs/discord
 * Send all log files (combined + error) to Discord webhook.
 * No parameters needed - sends all available logs.
 */
export async function sendLogsToDiscord(_req: Request, res: Response) {
  try {
    const result = await sendAllLogsToDiscord("backend");

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        filesSent: result.filesSent,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error: any) {
    logger.error("Error in admin logs/discord endpoint:", error);
    res.status(500).json({ error: "Failed to send logs to Discord" });
  }
}
