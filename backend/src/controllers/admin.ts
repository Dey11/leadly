import type { Request, Response } from "express";
import { sendAllLogsToDiscord } from "../services/logger.service";
import logger from "../lib/logger";
import { z } from "zod";
import { getMonitorDuplicateDiagnostics } from "../services/monitor-diagnostics";
import {
  MonitorDuplicateRepairError,
  repairMonitorDuplicates,
} from "../services/monitor-duplicate-repair";
import { recoverStaleMonitorJobs } from "../services/monitor-job-recovery";

const monitorDiagnosticsSchema = z.object({
  email: z.string().email(),
});

const monitorDedupeSchema = z
  .object({
    email: z.string().email(),
    dryRun: z.boolean().default(true),
    confirmAccountId: z.string().optional(),
  })
  .strict();

const monitorJobRecoverySchema = z
  .object({
    email: z.string().email(),
    dryRun: z.boolean().default(true),
    confirmAccountId: z.string().optional(),
    confirmJobIds: z.array(z.string()).optional(),
  })
  .strict();

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

export async function dedupeMonitors(req: Request, res: Response) {
  const payload = monitorDedupeSchema.safeParse(req.body);

  if (!payload.success) {
    return res.status(400).json({ error: "Invalid monitor repair request" });
  }

  try {
    const result = await repairMonitorDuplicates(payload.data);
    logger.info(
      `Admin monitor dedupe ${result.applied ? "applied" : "previewed"} for account ${result.plan.accountId}`,
    );
    return res.json({ payload: result });
  } catch (error) {
    if (error instanceof MonitorDuplicateRepairError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    logger.error("Failed to repair monitor duplicates:", error);
    return res.status(500).json({ error: "Failed to repair monitors" });
  }
}

export async function recoverMonitorJobs(req: Request, res: Response) {
  const payload = monitorJobRecoverySchema.safeParse(req.body);

  if (!payload.success) {
    return res.status(400).json({ error: "Invalid job recovery request" });
  }

  try {
    const result = await recoverStaleMonitorJobs(payload.data);
    logger.info(
      `Admin monitor job recovery ${result.applied ? "applied" : "previewed"} for account ${result.accountId}`,
    );
    return res.json({ payload: result });
  } catch (error) {
    if (error instanceof MonitorDuplicateRepairError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    logger.error("Failed to recover stale monitor jobs:", error);
    return res.status(500).json({ error: "Failed to recover monitor jobs" });
  }
}
