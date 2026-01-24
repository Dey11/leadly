import { Router } from "express";
import { authMiddlewareVerifiedOnly } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import {
  cancelSubscription,
  manageSubscription,
  previewPlanChange,
  subscribe,
} from "../controllers/billing";

const router = Router();

router.post(
  "/subscribe",
  authMiddlewareVerifiedOnly,
  userRateLimit("billing"),
  subscribe,
);

router.post(
  "/preview-plan-change",
  authMiddlewareVerifiedOnly,
  userRateLimit("billing"),
  previewPlanChange,
);

router.post(
  "/portal/manage",
  authMiddlewareVerifiedOnly,
  userRateLimit("billing"),
  manageSubscription,
);

router.post(
  "/portal/cancel",
  authMiddlewareVerifiedOnly,
  userRateLimit("billing"),
  cancelSubscription,
);

export default router;
