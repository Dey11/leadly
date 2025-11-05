import { z } from "zod/v4";

export const patchAccountSchema = z
  .object({
    name: z.string().min(1).max(32),
  })
  .strict();
