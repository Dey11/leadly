import { Router } from "express";
import {
  getAccount,
  patchAccount,
  deleteAccount,
  getAccountSessions,
} from "../controllers/account";
import { authMiddleware } from "../middleware/auth";

export const accountRouter = Router();

accountRouter.get("/", authMiddleware, getAccount);

accountRouter.patch("/", authMiddleware, patchAccount);

accountRouter.delete("/", authMiddleware, deleteAccount);

accountRouter.get("/sessions", authMiddleware, getAccountSessions);
