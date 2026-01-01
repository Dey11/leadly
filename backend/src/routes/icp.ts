import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as icpController from "../controllers/icp";
import * as icpAiController from "../controllers/icp.ai";

const router = Router();

router.post("/ai/suggest", authMiddleware, icpAiController.suggestIcp);
router.post("/", authMiddleware, icpController.createIcp);
router.get("/", authMiddleware, icpController.getIcps);
router.get("/:id", authMiddleware, icpController.getIcp);
router.patch("/:id", authMiddleware, icpController.updateIcp);
router.delete("/:id", authMiddleware, icpController.deleteIcp);

export default router;
