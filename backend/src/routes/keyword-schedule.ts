import { Router } from "express";
import {
  createKeywordSchedule,
  getKeywordSchedule,
  updateKeywordSchedule,
} from "../controllers/keyword-schedule";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

const router = Router();

router.use(authMiddleware);

router.get("/", userRateLimit("read"), getKeywordSchedule);
router.post("/", userRateLimit("write"), createKeywordSchedule);
router.patch("/", userRateLimit("write"), updateKeywordSchedule);

export default router;
