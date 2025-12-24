import { z } from "zod/v4";

export const registerSchema = z.object({
  name: z.string({ error: "Name is required" }).min(1, "Name is required").max(32, "Name must be 32 characters or less"),
  email: z.string({ error: "Email is required" }).email("Please enter a valid email").max(255),
  password: z.string({ error: "Password is required" }).min(8, "Password must be at least 8 characters").max(32, "Password must be 32 characters or less"),
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
  password: z.string().min(8, "Password must be at least 8 characters").max(32, "Password must be 32 characters or less"),
});

export const requestEmailChangeSchema = z.object({
  newEmail: z.string().email("Please enter a valid email").max(255),
  password: z.string().min(1, "Password is required"),
});

export const confirmEmailChangeSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export function formatZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  return firstIssue?.message || "Validation failed";
}
