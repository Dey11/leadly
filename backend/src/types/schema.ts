import { z } from "zod/v4";

export const registerSchema = z.object({
  name: z.string().min(1).max(32),
  email: z.string().email().max(255),
  password: z.string().min(8).max(32), // TODO: Add password validation
});
