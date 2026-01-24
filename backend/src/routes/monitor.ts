import { Router } from "express";
import { authMiddleware, authMiddlewareVerifiedOnly } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import * as monitorController from "../controllers/monitor";
import * as monitorAiController from "../controllers/monitor.ai";

const router = Router();

router.post(
  "/ai/suggest-subreddits",
  authMiddlewareVerifiedOnly,
  userRateLimit("ai"),
  monitorAiController.suggestSubreddits,
);
router.post(
  "/",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  monitorController.createMonitor,
);
router.get(
  "/",
  authMiddleware,
  userRateLimit("read"),
  monitorController.getMonitors,
);
router.put(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  monitorController.updateMonitor,
);
router.delete(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("delete"),
  monitorController.deleteMonitor,
);

export default router;
