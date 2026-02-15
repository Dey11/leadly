import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({
  quiet: true,
});

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string(),
  FRONTEND_URL: z.string(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
    .default(process.env.NODE_ENV === "production" ? "info" : "debug"),

  NITTER_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  REDDIT_CLIENT_ID: z.string(),
  REDDIT_CLIENT_SECRET: z.string(),
  REDDIT_USERNAME: z.string().default("nashediCHowkidar"),

  // Dodo Payments
  DODO_API_KEY: z.string().min(1, "DODO_API_KEY is required"),
  DODO_ENVIRONMENT: z.enum(["test_mode", "live_mode"]).default("test_mode"),
  DODO_WEBHOOK_SECRET: z.string().min(1, "DODO_WEBHOOK_SECRET is required"),
  DODO_PRO_PRODUCT_ID: z.string().min(1, "DODO_PRO_PRODUCT_ID is required"),
  DODO_PREMIUM_PRODUCT_ID: z
    .string()
    .min(1, "DODO_PREMIUM_PRODUCT_ID is required"),

  // URLs
  WEBHOOK_PUBLIC_URL: z.string().url().optional(),

  // Feature flags
  // Enforcement: "on" in production (blocks over-quota), "log" in dev (allows but logs)
  FEATURE_BILLING_ENFORCEMENT: z
    .enum(["off", "log", "on"])
    .default(process.env.NODE_ENV === "production" ? "on" : "log"),

  // Resend
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),

  // Google Generative AI
  GOOGLE_GENERATIVE_AI_API_KEY: z
    .string()
    .min(1, "GOOGLE_GENERATIVE_AI_API_KEY is required"),

  // Discord
  DISCORD_WEBHOOK_URL: z.string().url().optional(),
  DISCORD_PAYMENT_WEBHOOK_URL: z.string().url().optional(),
  DISCORD_LOGS_WEBHOOK_URL: z.string().url().optional(),

  // Admin
  ADMIN_API_KEY: z.string().min(32).optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_REDIRECT_URI: z.string().url("GOOGLE_REDIRECT_URI must be a valid URL"),
});

export const env = envSchema.parse(process.env);
