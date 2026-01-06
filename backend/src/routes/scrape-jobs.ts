import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import * as leadController from "../controllers/lead";

const router = Router();

router.get(
  "/:monitorId/jobs",
  authMiddleware,
  userRateLimit("read"),
  leadController.getScrapeJobs,
);

export default router;
