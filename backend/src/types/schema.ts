import { z } from "zod/v4";

const passwordSchema = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(32, "Password must be 32 characters or less")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const registerSchema = z.object({
  name: z.string({ error: "Name is required" }).min(1, "Name is required").max(32, "Name must be 32 characters or less"),
  email: z.string({ error: "Email is required" }).email("Please enter a valid email").max(255),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string({ error: "Email is required" }).email("Please enter a valid email").max(255),
  password: z.string({ error: "Password is required" }).min(8, "Password must be at least 8 characters").max(32),
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Please enter a valid email").max(255),
  otp: z.string().length(6, "Verification code must be 6 digits"),
});

export const resendVerificationEmailSchema = z.object({
  email: z.string().email("Please enter a valid email").max(255),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email").max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

export function formatZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  return firstIssue?.message || "Validation failed";
}
