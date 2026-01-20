import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import {
  cancelSubscription,
  manageSubscription,
  previewPlanChange,
  subscribe,
} from "../controllers/billing";

const router = Router();

router.post("/subscribe", authMiddleware, userRateLimit("billing"), subscribe);

router.post(
  "/preview-plan-change",
  authMiddleware,
  userRateLimit("billing"),
  previewPlanChange,
);

router.post(
  "/portal/manage",
  authMiddleware,
  userRateLimit("billing"),
  manageSubscription,
);

router.post(
  "/portal/cancel",
  authMiddleware,
  userRateLimit("billing"),
  cancelSubscription,
);

export default router;
