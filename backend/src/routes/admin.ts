import express from "express";
import { requireAdminApiKey } from "../middleware/admin-auth";
import {
  dedupeMonitors,
  getMonitorDiagnostics,
  recoverMonitorJobs,
  sendLogsToDiscord,
} from "../controllers/admin";
import {
  createAdminBlogPost,
  updateAdminBlogPost,
  listAdminBlogPosts,
} from "../controllers/admin-blog";

const router = express.Router();

// All admin routes require API key authentication
router.use(requireAdminApiKey);

/**
 * POST /api/v1/admin/logs/discord
 * Send all log files (combined + error) to Discord webhook.
 * No request body required.
 */
router.post("/logs/discord", sendLogsToDiscord);

/**
 * POST /api/v1/admin/monitors/diagnostics
 * Inspect exact duplicate monitor groups for an account email.
 */
router.post("/monitors/diagnostics", getMonitorDiagnostics);

/**
 * POST /api/v1/admin/monitors/dedupe
 * Preview or apply a lossless repair for imported duplicate monitor graphs.
 */
router.post("/monitors/dedupe", dedupeMonitors);

/**
 * POST /api/v1/admin/monitors/jobs/recover
 * Preview or replace account-scoped scrape jobs orphaned by a worker failure.
 */
router.post("/monitors/jobs/recover", recoverMonitorJobs);

/**
 * GET /api/v1/admin/blog/posts
 * List blog posts, including drafts and scheduled posts.
 * Supports ?status= and ?limit= query params.
 */
router.get("/blog/posts", listAdminBlogPosts);

/**
 * POST /api/v1/admin/blog/posts
 * Create a new blog post.
 */
router.post("/blog/posts", createAdminBlogPost);

/**
 * PUT /api/v1/admin/blog/posts/:slug
 * Update an existing blog post identified by its current slug.
 */
router.put("/blog/posts/:slug", updateAdminBlogPost);

export default router;
