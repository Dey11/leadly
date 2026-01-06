import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import * as icpController from "../controllers/icp";
import * as icpAiController from "../controllers/icp.ai";

const router = Router();

router.post(
  "/ai/suggest",
  authMiddleware,
  userRateLimit("ai"),
  icpAiController.suggestIcp,
);
router.post(
  "/",
  authMiddleware,
  userRateLimit("write"),
  icpController.createIcp,
);
router.get("/", authMiddleware, userRateLimit("read"), icpController.getIcps);
router.get("/:id", authMiddleware, userRateLimit("read"), icpController.getIcp);
router.patch(
  "/:id",
  authMiddleware,
  userRateLimit("write"),
  icpController.updateIcp,
);
router.delete(
  "/:id",
  authMiddleware,
  userRateLimit("delete"),
  icpController.deleteIcp,
);

export default router;
