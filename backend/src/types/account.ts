import { z } from "zod/v4";

export const patchAccountSchema = z
  .object({
    name: z.string().min(1).max(32),
  })
  .strict();

export const patchProfileSchema = z
  .object({
    company: z.string().max(100).optional(),
    occupation: z.string().max(50).optional(),
    referrer: z.string().max(50).optional(),
    sampleDm: z.string().max(1000).optional(),
    hasCompletedOnboarding: z.boolean().optional(),
  })
  .strict();
