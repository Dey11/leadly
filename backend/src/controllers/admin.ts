import type { Request, Response } from "express";
import { sendAllLogsToDiscord } from "../services/logger.service";
import logger from "../lib/logger";
import { z } from "zod";
import { getMonitorDuplicateDiagnostics } from "../services/monitor-diagnostics";
import {
  MonitorDuplicateRepairError,
  repairMonitorDuplicates,
} from "../services/monitor-duplicate-repair";
import {
  recoverStaleMonitorJobs,
  retryFailedMonitorJobs,
} from "../services/monitor-job-recovery";
import {
  pauseAllAutomationAdministratively,
  previewAdministrativeAutomationPause,
} from "../services/automation";

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

const administrativeAutomationPauseSchema = z.discriminatedUnion("dryRun", [
  z.object({ dryRun: z.literal(true) }).strict(),
  z
    .object({
      dryRun: z.literal(false),
      confirm: z.literal("PAUSE_ALL_AUTOMATION"),
    })
    .strict(),
]);

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

/** Preview or apply the all-tier account automation pause. */
export async function pauseAccountAutomation(req: Request, res: Response) {
  const payload = administrativeAutomationPauseSchema.safeParse(req.body);

  if (!payload.success) {
    return res.status(400).json({
      error:
        "Use dryRun=true, or confirm PAUSE_ALL_AUTOMATION when applying the pause.",
    });
  }

  try {
    if (payload.data.dryRun) {
      const preview = await previewAdministrativeAutomationPause();
      return res.json({ payload: { applied: false, ...preview } });
    }

    const result = await pauseAllAutomationAdministratively();
    return res.json({ payload: { applied: true, ...result } });
  } catch (error) {
    logger.error("Failed to pause account automation:", error);
    return res
      .status(500)
      .json({ error: "Failed to pause account automation" });
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

export async function retryFailedMonitorJobsHandler(
  req: Request,
  res: Response,
) {
  const payload = monitorJobRecoverySchema.safeParse(req.body);

  if (!payload.success) {
    return res.status(400).json({ error: "Invalid job retry request" });
  }

  try {
    const result = await retryFailedMonitorJobs(payload.data);
    logger.info(
      `Admin failed monitor job retry ${result.applied ? "applied" : "previewed"} for account ${result.accountId}`,
    );
    return res.json({ payload: result });
  } catch (error) {
    if (error instanceof MonitorDuplicateRepairError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    logger.error("Failed to retry monitor jobs:", error);
    return res.status(500).json({ error: "Failed to retry monitor jobs" });
  }
}
