import { Router } from "express";
import { authMiddleware, authMiddlewareVerifiedOnly } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import * as icpController from "../controllers/icp";
import * as icpAiController from "../controllers/icp.ai";

const router = Router();

router.post(
  "/ai/suggest",
  authMiddlewareVerifiedOnly,
  userRateLimit("ai"),
  icpAiController.suggestIcp,
);
router.post(
  "/",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  icpController.createIcp,
);
router.get("/", authMiddleware, userRateLimit("read"), icpController.getIcps);
router.get("/:id", authMiddleware, userRateLimit("read"), icpController.getIcp);
router.patch(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  icpController.updateIcp,
);
router.delete(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("delete"),
  icpController.deleteIcp,
);

export default router;
