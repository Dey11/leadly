import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as monitorController from "../controllers/monitor";
import * as monitorAiController from "../controllers/monitor.ai";

const router = Router();

router.post(
  "/ai/suggest-subreddits",
  authMiddleware,
  monitorAiController.suggestSubreddits,
);
router.post("/", authMiddleware, monitorController.createMonitor);
router.get("/", authMiddleware, monitorController.getMonitors);
router.put("/:id", authMiddleware, monitorController.updateMonitor);
router.delete("/:id", authMiddleware, monitorController.deleteMonitor);

export default router;
