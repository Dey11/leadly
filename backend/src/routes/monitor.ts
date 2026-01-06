import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import * as monitorController from "../controllers/monitor";
import * as monitorAiController from "../controllers/monitor.ai";

const router = Router();

router.post(
  "/ai/suggest-subreddits",
  authMiddleware,
  userRateLimit("ai"),
  monitorAiController.suggestSubreddits,
);
router.post(
  "/",
  authMiddleware,
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
  authMiddleware,
  userRateLimit("write"),
  monitorController.updateMonitor,
);
router.delete(
  "/:id",
  authMiddleware,
  userRateLimit("delete"),
  monitorController.deleteMonitor,
);

export default router;
