import { Router } from "express";
import {
  getAccount,
  patchAccount,
  deleteAccount,
  getAccountSessions,
  getUsageSummary,
  updateWalkthroughStatus,
} from "../controllers/account";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

export const accountRouter = Router();

accountRouter.get("/", authMiddleware, userRateLimit("read"), getAccount);

accountRouter.patch("/", authMiddleware, userRateLimit("write"), patchAccount);

accountRouter.delete(
  "/",
  authMiddleware,
  userRateLimit("delete"),
  deleteAccount,
);

accountRouter.get(
  "/sessions",
  authMiddleware,
  userRateLimit("read"),
  getAccountSessions,
);

accountRouter.get(
  "/usage",
  authMiddleware,
  userRateLimit("read"),
  getUsageSummary,
);
accountRouter.patch(
  "/walkthrough",
  authMiddleware,
  userRateLimit("write"),
  updateWalkthroughStatus,
);
