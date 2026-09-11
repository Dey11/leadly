import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({
  quiet: true,
});

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
);

const optionalUrl = z.preprocess(
  emptyStringToUndefined,
  z.string().url().optional(),
);

const envSchema = z
  .object({
    PORT: z.string().default("3000"),
    DATABASE_URL: z.string(),
    SESSION_SECRET: z.string(),
    FRONTEND_URL: z.string().url(),
    COOKIE_DOMAIN: optionalString,
    EMAIL_FROM: optionalString,
    SECURITY_EMAIL_FROM: optionalString,
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
    NEBIUS_API_KEY: z.string().min(1, "NEBIUS_API_KEY is required"),

    // Discord
    DISCORD_WEBHOOK_URL: z.string().url().optional(),
    DISCORD_PAYMENT_WEBHOOK_URL: z.string().url().optional(),
    DISCORD_LOGS_WEBHOOK_URL: z.string().url().optional(),

    // Admin
    ADMIN_API_KEY: z.string().min(32).optional(),

    // Google OAuth. Credentials are only required when the feature is enabled.
    GOOGLE_OAUTH_ENABLED: z
      .enum(["true", "false"])
      .default("true")
      .transform((value) => value === "true"),
    GOOGLE_CLIENT_ID: optionalString,
    GOOGLE_CLIENT_SECRET: optionalString,
    GOOGLE_REDIRECT_URI: optionalUrl,
  })
  .superRefine((values, context) => {
    if (values.GOOGLE_OAUTH_ENABLED) {
      for (const key of [
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_REDIRECT_URI",
      ] as const) {
        if (!values[key]) {
          context.addIssue({
            code: "custom",
            path: [key],
            message: `${key} is required when Google OAuth is enabled`,
          });
        }
      }
    }

    if (values.NODE_ENV === "production") {
      for (const key of ["EMAIL_FROM", "SECURITY_EMAIL_FROM"] as const) {
        if (!values[key]) {
          context.addIssue({
            code: "custom",
            path: [key],
            message: `${key} is required in production`,
          });
        }
      }
    }
  });

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  EMAIL_FROM: parsedEnv.EMAIL_FROM ?? "Leadly Team <hello@localhost>",
  SECURITY_EMAIL_FROM:
    parsedEnv.SECURITY_EMAIL_FROM ?? "Leadly Security <security@localhost>",
};
