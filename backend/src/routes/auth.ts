import { Router } from "express";
import {
  login,
  register,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth";
import { rateLimit } from "../lib/rate-limit";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/verify-email", rateLimit("verifyEmail"), verifyEmail);
authRouter.post("/resend-verification-email", resendVerificationEmail);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", rateLimit("resetPassword"), resetPassword);
