import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import * as leadController from "../controllers/lead";

const router = Router();

router.get("/", authMiddleware, userRateLimit("read"), leadController.getLeads);
router.get(
  "/:id",
  authMiddleware,
  userRateLimit("read"),
  leadController.getLead,
);
router.patch(
  "/:id",
  authMiddleware,
  userRateLimit("write"),
  leadController.updateLead,
);
router.delete(
  "/:id",
  authMiddleware,
  userRateLimit("delete"),
  leadController.deleteLead,
);

export default router;
