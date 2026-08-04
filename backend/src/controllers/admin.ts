import type { Request, Response } from "express";
import { sendAllLogsToDiscord } from "../services/logger.service";
import logger from "../lib/logger";
import { z } from "zod";
import { getMonitorDuplicateDiagnostics } from "../services/monitor-diagnostics";

const monitorDiagnosticsSchema = z.object({
  email: z.string().email(),
});

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

export async function getMonitorDiagnostics(req: Request, res: Response) {
  const payload = monitorDiagnosticsSchema.safeParse(req.body);

  if (!payload.success) {
    return res.status(400).json({ error: "A valid email is required" });
  }

  try {
    const diagnostics = await getMonitorDuplicateDiagnostics(
      payload.data.email,
    );

    if (!diagnostics) {
      return res.status(404).json({ error: "Account not found" });
    }

    return res.json({ payload: diagnostics });
  } catch (error) {
    logger.error("Failed to inspect monitor duplicates:", error);
    return res.status(500).json({ error: "Failed to inspect monitors" });
  }
}
