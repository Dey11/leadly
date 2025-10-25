import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as scheduleController from "../controllers/schedule";

const router = Router();

router.get("/", authMiddleware, scheduleController.getSchedule);
router.patch("/", authMiddleware, scheduleController.updateSchedule);
router.get("/limits", authMiddleware, scheduleController.getTierLimits);

export default router;
