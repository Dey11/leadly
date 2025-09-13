import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
  FRONTEND_URL: z.string(),
  NITTER_URL: z.string(),
  SESSION_SECRET: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6380"),
});

export const env = envSchema.parse(process.env);
