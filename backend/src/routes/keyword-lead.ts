import { Router } from "express";
import {
  deleteKeywordLead,
  exportKeywordLeads,
  getKeywordLead,
  getKeywordLeads,
  updateKeywordLead,
} from "../controllers/keyword-lead";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

const router = Router();

router.use(authMiddleware);

router.get("/", userRateLimit("read"), getKeywordLeads);
router.get("/export", userRateLimit("read"), exportKeywordLeads);
router.get("/:id", userRateLimit("read"), getKeywordLead);
router.patch("/:id", userRateLimit("write"), updateKeywordLead);
router.delete("/:id", userRateLimit("delete"), deleteKeywordLead);

export default router;
