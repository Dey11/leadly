import { Router } from "express";
import { getKeywordStats } from "../controllers/keyword-stats";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

const router = Router();

router.get("/", authMiddleware, userRateLimit("read"), getKeywordStats);

export default router;
