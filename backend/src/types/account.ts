import { z } from "zod/v4";

export const patchAccountSchema = z.object({
  name: z.string().min(1).max(32).optional(),
  image: z.string().url().max(255).optional(),
  email: z.string().email().max(255).optional(),
  password: z.string().min(8).max(32).optional(),
});
