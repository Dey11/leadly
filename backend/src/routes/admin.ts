import express from "express";
import { requireAdminApiKey } from "../middleware/admin-auth";
import { sendLogsToDiscord } from "../controllers/admin";

const router = express.Router();

// All admin routes require API key authentication
router.use(requireAdminApiKey);

/**
 * POST /api/v1/admin/logs/discord
 * Send all log files (combined + error) to Discord webhook.
 * No request body required.
 */
router.post("/logs/discord", sendLogsToDiscord);

export default router;
