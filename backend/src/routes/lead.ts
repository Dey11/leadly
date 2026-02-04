import { Router } from "express";
import { authMiddleware, authMiddlewareVerifiedOnly } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";
import * as leadController from "../controllers/lead";
import * as leadAiController from "../controllers/lead.ai";

const router = Router();

router.get("/", authMiddleware, userRateLimit("read"), leadController.getLeads);
router.get(
  "/export",
  authMiddleware,
  userRateLimit("read"),
  leadController.exportLeads,
);
router.get(
  "/:id",
  authMiddleware,
  userRateLimit("read"),
  leadController.getLead,
);

router.post(
  "/:id/generate-dm",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  leadAiController.generateDm,
);

router.patch(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("write"),
  leadController.updateLead,
);
router.delete(
  "/:id",
  authMiddlewareVerifiedOnly,
  userRateLimit("delete"),
  leadController.deleteLead,
);

export default router;
