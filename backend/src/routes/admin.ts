import express from "express";
import { requireAdminApiKey } from "../middleware/admin-auth";
import {
  getLogFiles,
  downloadLogFile,
  sendLogsToDiscord,
} from "../controllers/admin";

const router = express.Router();

// All admin routes require API key authentication
router.use(requireAdminApiKey);

/**
 * GET /api/v1/admin/logs
 * List available log files
 */
router.get("/logs", getLogFiles);

/**
 * GET /api/v1/admin/logs/:filename
 * Download a specific log file
 */
router.get("/logs/:filename", downloadLogFile);

/**
 * POST /api/v1/admin/logs/discord
 * Send recent logs to Discord webhook
 * Body: { level?: 'error' | 'combined', lines?: number }
 */
router.post("/logs/discord", sendLogsToDiscord);

export default router;
