import { Router } from "express";
import {
  createKeywordMonitor,
  deleteKeywordMonitor,
  getKeywordMonitor,
  getKeywordMonitors,
  updateKeywordMonitor,
} from "../controllers/keyword-monitor";
import { suggestSubreddits } from "../controllers/keyword-monitor.ai";
import { authMiddleware, authMiddlewareVerifiedOnly } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

const router = Router();

router.get("/", authMiddleware, userRateLimit("read"), getKeywordMonitors);
router.get("/:id", authMiddleware, userRateLimit("read"), getKeywordMonitor);

router.post(
  "/",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  createKeywordMonitor,
);
router.post(
  "/ai/suggest",
  authMiddlewareVerifiedOnly,
  userRateLimit("ai"),
  suggestSubreddits,
);
router.patch(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  updateKeywordMonitor,
);
router.delete(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("delete"),
  deleteKeywordMonitor,
);

export default router;
