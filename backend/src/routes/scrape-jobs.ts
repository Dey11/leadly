import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as leadController from "../controllers/lead";

const router = Router();

router.get("/:monitorId/jobs", authMiddleware, leadController.getScrapeJobs);

export default router;
