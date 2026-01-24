import { Router } from "express";
import {
  deleteKeywordLead,
  exportKeywordLeads,
  getKeywordLead,
  getKeywordLeads,
  updateKeywordLead,
} from "../controllers/keyword-lead";
import { authMiddleware, authMiddlewareVerifiedOnly } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

const router = Router();

router.get("/", authMiddleware, userRateLimit("read"), getKeywordLeads);
router.get(
  "/export",
  authMiddleware,
  userRateLimit("read"),
  exportKeywordLeads,
);
router.get("/:id", authMiddleware, userRateLimit("read"), getKeywordLead);

router.patch(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  updateKeywordLead,
);
router.delete(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("delete"),
  deleteKeywordLead,
);

export default router;
