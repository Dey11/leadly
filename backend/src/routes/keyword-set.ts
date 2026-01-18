import { Router } from "express";
import {
  createKeywordSet,
  deleteKeywordSet,
  getKeywordSet,
  getKeywordSets,
  updateKeywordSet,
} from "../controllers/keyword-set";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

const router = Router();

router.use(authMiddleware);

router.post("/", userRateLimit("write"), createKeywordSet);
router.get("/", userRateLimit("read"), getKeywordSets);
router.get("/:id", userRateLimit("read"), getKeywordSet);
router.patch("/:id", userRateLimit("write"), updateKeywordSet);
router.delete("/:id", userRateLimit("delete"), deleteKeywordSet);

export default router;
