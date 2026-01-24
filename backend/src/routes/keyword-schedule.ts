import { Router } from "express";
import {
  createKeywordSchedule,
  getKeywordSchedule,
  updateKeywordSchedule,
} from "../controllers/keyword-schedule";
import { authMiddleware, authMiddlewareVerifiedOnly } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

const router = Router();

router.get("/", authMiddleware, userRateLimit("read"), getKeywordSchedule);

router.post(
  "/",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  createKeywordSchedule,
);
router.patch(
  "/",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  updateKeywordSchedule,
);

export default router;
