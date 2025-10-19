import { Router } from "express";
import {
  getAccount,
  patchAccount,
  deleteAccount,
  getAccountSessions,
} from "../controllers/account";
import { authMiddleware } from "../middleware/auth";

export const accountRouter = Router();

accountRouter.get("/account", authMiddleware, getAccount);

accountRouter.patch("/account", authMiddleware, patchAccount);

accountRouter.delete("/account", authMiddleware, deleteAccount);

accountRouter.get("/account/sessions", authMiddleware, getAccountSessions);
