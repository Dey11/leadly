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

  NITTER_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6380"),

  REDDIT_CLIENT_ID: z.string(),
  REDDIT_CLIENT_SECRET: z.string(),
  REDDIT_USERNAME: z.string().default("nashediCHowkidar"),
});

export const env = envSchema.parse(process.env);
