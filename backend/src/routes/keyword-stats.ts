import { Router } from "express";
import { getKeywordStats } from "../controllers/keyword-stats";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

const router = Router();

router.use(authMiddleware);

router.get("/", userRateLimit("read"), getKeywordStats);

export default router;
