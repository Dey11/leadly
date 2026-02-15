import { Router } from "express";
import {
  googleOAuthInitiate,
  googleOAuthCallback,
} from "../controllers/google-oauth";
import { rateLimit } from "../lib/rate-limit";

export const googleOAuthRouter = Router();

// GET /api/v1/auth/google — Redirects to Google's consent screen
googleOAuthRouter.get("/google", rateLimit("login"), googleOAuthInitiate);

// GET /api/v1/auth/google/callback — Handles the OAuth callback
googleOAuthRouter.get("/google/callback", rateLimit("login"), googleOAuthCallback);
