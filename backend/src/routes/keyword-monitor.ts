import { Router } from "express";
import {
  createKeywordMonitor,
  deleteKeywordMonitor,
  getKeywordMonitor,
  getKeywordMonitors,
  updateKeywordMonitor,
} from "../controllers/keyword-monitor";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

const router = Router();

router.use(authMiddleware);

router.get("/", userRateLimit("read"), getKeywordMonitors);
router.post("/", userRateLimit("write"), createKeywordMonitor);
router.get("/:id", userRateLimit("read"), getKeywordMonitor);
router.patch("/:id", userRateLimit("write"), updateKeywordMonitor);
router.delete("/:id", userRateLimit("delete"), deleteKeywordMonitor);

export default router;
