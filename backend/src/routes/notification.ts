import { Router } from "express";
import { authMiddleware, authMiddlewareVerifiedOnly } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import * as notificationController from "../controllers/notification";

const router = Router();

router.get(
  "/",
  authMiddleware,
  userRateLimit("read"),
  notificationController.getNotificationSettings,
);

router.put(
  "/",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  notificationController.upsertNotificationChannel,
);

router.post(
  "/test",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  notificationController.sendNotificationTestMessage,
);

export default router;
