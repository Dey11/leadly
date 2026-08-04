import express from "express";
import { requireAdminApiKey } from "../middleware/admin-auth";
import { getMonitorDiagnostics, sendLogsToDiscord } from "../controllers/admin";
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
