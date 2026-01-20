import { Resend } from "resend";
import { env } from "../env";
import { SUPPORT_EMAIL } from "./constants";
import { SubscriptionTier } from "@prisma/client";

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

export async function sendSubscriptionActiveEmail(
  email: string,
  subscriptionId: string,
  periodEnd: Date,
) {
  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "Your subscription is active - Leadly",
    html: `
      <h2>Your subscription is active!</h2>
      <p>Your subscription is active until ${periodEnd.toLocaleDateString()}.</p>
      <p>Your subscription ID is ${subscriptionId} (for internal use).</p>
      <p>If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      <p>Thank you for using Leadly!</p>
    `,
  });

  if (error) {
    console.error("Failed to send subscription active email:", error);
  }
}

export async function sendSubscriptionOnHoldEmail(
  email: string,
  subscriptionId: string,
  periodEnd: Date,
) {
  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "Your subscription is on hold - Leadly",
    html: `
      <h2>Your subscription is on hold!</h2>
      <p>Your subscription is on hold until ${periodEnd.toLocaleDateString()}.</p>
      <p>Your subscription ID is ${subscriptionId} (for internal use).</p>
      <p> Please go to the billing page > manage subscription > update your payment details in the Dodo Payments portal.</p>
      <p>If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      <p>Thank you for using Leadly!</p>
    `,
  });

  if (error) {
    console.error("Failed to send subscription on hold email:", error);
  }
}

export async function sendSubscriptionRenewedEmail(
  email: string,
  subscriptionId: string,
  periodEnd: Date,
) {
  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "Your subscription is renewed - Leadly",
    html: `
      <h2>Your subscription is renewed!</h2>
      <p>Your subscription is renewed until ${periodEnd.toLocaleDateString()}.</p>
      <p>Your subscription ID is ${subscriptionId} (for internal use).</p>
      <p>If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      <p>Thank you for using Leadly!</p>
    `,
  });

  if (error) {
    console.error("Failed to send subscription renewed email:", error);
  }
}

export async function sendSubscriptionPlanChangedEmail(
  email: string,
  subscriptionId: string,
  tier: SubscriptionTier,
) {
  const planName =
    tier === SubscriptionTier.FREE
      ? "Free"
      : tier === SubscriptionTier.PRO
        ? "Pro"
        : "Premium";
  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "Your subscription plan is changed - Leadly",
    html: `
      <h2>Your subscription plan is changed!</h2>
      <p>Your new plan is ${planName}.</p>
      <p>Your subscription ID is ${subscriptionId} (for internal use).</p>
      <p>If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      <p>Thank you for using Leadly!</p>
    `,
  });

  if (error) {
    console.error("Failed to send subscription plan changed email:", error);
  }
}

export async function sendSubscriptionCancelledEmail(
  email: string,
  subscriptionId: string,
) {
  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "Your subscription is cancelled - Leadly",
    html: `
      <h2>Your subscription is cancelled!</h2>
      <p>You can reactivate it back anytime.</p>
      <p>You are in the free plan now.</p>
      <p>Your subscription ID is ${subscriptionId} (for internal use).</p>
      <p>If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      <p>Thank you for using Leadly!</p>
    `,
  });

  if (error) {
    console.error("Failed to send subscription cancelled email:", error);
  }
}

export async function sendSubscriptionExpiredEmail(
  email: string,
  subscriptionId: string,
) {
  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "Your subscription is expired - Leadly",
    html: `
      <h2>Your subscription is expired!</h2>
      <p>You can reactivate it back anytime.</p>
      <p>You are in the free plan now.</p>
      <p>Your subscription ID is ${subscriptionId} (for internal use).</p>
      <p>If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      <p>Thank you for using Leadly!</p>
    `,
  });

  if (error) {
    console.error("Failed to send subscription expired email:", error);
  }
}

export async function sendSubscriptionFailedEmail(
  email: string,
  subscriptionId: string,
) {
  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "Your subscription has failed - Leadly",
    html: `
      <h2>Your subscription is failed!</h2>
      <p>Please try again later or update your payment details.</p>
      <p>You are in the free plan now.</p>
      <p>Your subscription ID is ${subscriptionId} (for internal use).</p>
      <p>If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      <p>Thank you for using Leadly!</p>
    `,
  });

  if (error) {
    console.error("Failed to send subscription failed email:", error);
  }
}
