import { Router } from "express";
import {
  createKeywordSet,
  deleteKeywordSet,
  getKeywordSet,
  getKeywordSets,
  updateKeywordSet,
} from "../controllers/keyword-set";
import { authMiddleware, authMiddlewareVerifiedOnly } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

const router = Router();

router.get("/", authMiddleware, userRateLimit("read"), getKeywordSets);
router.get("/:id", authMiddleware, userRateLimit("read"), getKeywordSet);

router.post(
  "/",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  createKeywordSet,
);
router.patch(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  updateKeywordSet,
);
router.delete(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("delete"),
  deleteKeywordSet,
);

export default router;
