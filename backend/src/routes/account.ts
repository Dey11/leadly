import { Router } from "express";
import {
  getAccount,
  patchAccount,
  deleteAccount,
  getAccountSessions,
} from "../controllers/account";

export const accountRouter = Router();

accountRouter.get("/account", getAccount);

accountRouter.patch("/account", patchAccount);

accountRouter.delete("/account", deleteAccount);

accountRouter.get("/account/sessions", getAccountSessions);
