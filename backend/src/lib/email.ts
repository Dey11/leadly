import { Resend } from "resend";
import { env } from "../env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, otp: string) {
  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "Verify your email - Leadly",
    html: `
      <h2>Welcome to Leadly!</h2>
      <p>Your verification code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 4px; font-weight: bold;">${otp}</h1>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't create an account with Leadly, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: "Leadly Security <security@leadly.live>",
    to: email,
    subject: "Reset your password - Leadly",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to set a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a>
      <p style="margin-top: 24px;">Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}
