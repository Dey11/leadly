import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import * as scheduleController from "../controllers/schedule";

const router = Router();

router.get(
  "/",
  authMiddleware,
  userRateLimit("read"),
  scheduleController.getSchedule,
);
router.patch(
  "/",
  authMiddleware,
  userRateLimit("write"),
  scheduleController.updateSchedule,
);
router.get(
  "/limits",
  authMiddleware,
  userRateLimit("read"),
  scheduleController.getTierLimits,
);

export default router;
