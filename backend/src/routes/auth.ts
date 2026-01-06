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

authRouter.post("/register", rateLimit("register"), register);
authRouter.post("/login", rateLimit("login"), login);
authRouter.post("/logout", logout);
authRouter.post("/verify-email", rateLimit("verifyEmail"), verifyEmail);
authRouter.post("/resend-verification-email", rateLimit("resendOtp"), resendVerificationEmail);
authRouter.post("/forgot-password", rateLimit("forgotPassword"), forgotPassword);
authRouter.post("/reset-password", rateLimit("resetPassword"), resetPassword);

