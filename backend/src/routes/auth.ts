import { Router } from "express";
import { login, register, logout } from "../controllers/auth";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
