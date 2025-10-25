import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as leadController from "../controllers/lead";

const router = Router();

router.get("/", authMiddleware, leadController.getLeads);
router.get("/:id", authMiddleware, leadController.getLead);
router.patch("/:id", authMiddleware, leadController.updateLead);
router.delete("/:id", authMiddleware, leadController.deleteLead);

export default router;
