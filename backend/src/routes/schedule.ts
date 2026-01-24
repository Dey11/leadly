import { Router } from "express";
import { authMiddleware, authMiddlewareVerifiedOnly } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import * as scheduleController from "../controllers/schedule";

const router = Router();

router.get(
  "/",
  authMiddleware,
  userRateLimit("read"),
  scheduleController.getSchedule,
);
router.get(
  "/limits",
  authMiddleware,
  userRateLimit("read"),
  scheduleController.getTierLimits,
);

router.patch(
  "/",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  scheduleController.updateSchedule,
);

export default router;
