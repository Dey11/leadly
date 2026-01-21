import { Resend } from "resend";
import { env } from "../env";
import { SUPPORT_EMAIL } from "./constants";
import { SubscriptionTier } from "@prisma/client";
import logger from "./logger";
import fs from "fs";
import path from "path";

const resend = new Resend(env.RESEND_API_KEY);

// Brand Colors from globals.css
const COLORS = {
  wine: "#773344",
  paleDogwood: "#e3b5a4",
  linen: "#f5e9e2",
  licorice: "#0b0014",
  indianRed: "#d44d5c",
  white: "#ffffff",
  mutedText: "#5c3241",
};

// Read logo file for attachment
// Note: We need to handle this carefully to work in both dev and prod if paths differ
// Assuming standard repo structure for now
const LOGO_PATH = path.join(process.cwd(), "../frontend/public/assets/logo.svg");
let LOGO_BUFFER: Buffer | null = null;

try {
  if (fs.existsSync(LOGO_PATH)) {
    LOGO_BUFFER = fs.readFileSync(LOGO_PATH);
  } else {
    logger.warn(`Logo not found at ${LOGO_PATH}`);
  }
} catch (error) {
  logger.error("Failed to read logo file:", error);
}

// Reusable email template wrapper
function wrapEmailContent(content: string, preheader?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Leadly</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: ${COLORS.linen};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, ${COLORS.wine} 0%, ${COLORS.indianRed} 100%);
          color: ${COLORS.white} !important;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          display: inline-block;
          box-shadow: 0 4px 14px rgba(119, 51, 68, 0.35);
        }
        
        .btn-primary:hover {
          opacity: 0.9;
        }
        
        .otp-code {
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 8px;
          color: ${COLORS.wine};
          background: linear-gradient(135deg, ${COLORS.linen} 0%, ${COLORS.paleDogwood} 100%);
          padding: 20px 32px;
          border-radius: 12px;
          display: inline-block;
          border: 2px dashed ${COLORS.wine};
        }
        
        .footer-link {
          color: ${COLORS.wine};
          text-decoration: none;
        }
        
        .footer-link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ""}
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.linen};">
        <tr>
          <td style="padding: 40px 20px;">
            <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
              <!-- Header with Logo -->
              <tr>
                <td style="text-align: center; padding-bottom: 32px;">
                  <img src="cid:leadly-logo" alt="Leadly" width="48" height="48" style="display: inline-block; vertical-align: middle;" />
                  <span style="font-size: 28px; font-weight: 700; color: ${COLORS.wine}; vertical-align: middle; margin-left: 12px;">Leadly</span>
                </td>
              </tr>
              <!-- Main Content Card -->
              <tr>
                <td>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.white}; border-radius: 16px; box-shadow: 0 4px 24px rgba(119, 51, 68, 0.12);">
                    <tr>
                      <td style="padding: 40px;">
                        ${content}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="text-align: center; padding-top: 32px;">
                  <p style="margin: 0 0 8px 0; color: ${COLORS.mutedText}; font-size: 14px;">
                    Need help? <a href="mailto:${SUPPORT_EMAIL}" class="footer-link">${SUPPORT_EMAIL}</a>
                  </p>
                  <p style="margin: 0; color: ${COLORS.mutedText}; font-size: 12px; opacity: 0.7;">
                    © ${new Date().getFullYear()} Leadly. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendVerificationEmail(email: string, otp: string) {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
        <img src="cid:leadly-logo" alt="Leadly" width="64" height="64" />
      </div>
      <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: ${COLORS.licorice};">Welcome to Leadly! 🎉</h2>
      <p style="margin: 0 0 32px 0; color: ${COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
        We're excited to have you on board. Use the code below to verify your email and start finding your perfect leads.
      </p>
      <div style="margin-bottom: 32px;">
        <div class="otp-code">${otp}</div>
      </div>
      <p style="margin: 0; color: ${COLORS.mutedText}; font-size: 14px;">
        ⏱️ This code expires in <strong>15 minutes</strong>
      </p>
    </div>
    <hr style="border: none; border-top: 1px solid ${COLORS.paleDogwood}; margin: 32px 0;" />
    <p style="margin: 0; color: ${COLORS.mutedText}; font-size: 13px; text-align: center;">
      Didn't create an account with Leadly? You can safely ignore this email.
    </p>
  `;

  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "🔐 Verify your email - Leadly",
    html: wrapEmailContent(content, "Your verification code is ready"),
    attachments: LOGO_BUFFER
      ? [
          {
            filename: "logo.svg",
            content: LOGO_BUFFER,
            contentId: "leadly-logo",
          },
        ]
      : undefined,
  });

  if (error) {
    logger.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, ${COLORS.indianRed} 0%, ${COLORS.wine} 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">🔒</span>
      </div>
      <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: ${COLORS.licorice};">Reset Your Password</h2>
      <p style="margin: 0 0 32px 0; color: ${COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
        No worries, it happens to the best of us! Click the button below to set a new password for your account.
      </p>
      <a href="${resetUrl}" class="btn-primary" style="color: ${COLORS.white}; text-decoration: none;">
        Reset Password
      </a>
      <p style="margin: 32px 0 0 0; color: ${COLORS.mutedText}; font-size: 14px;">
        ⏱️ This link expires in <strong>1 hour</strong>
      </p>
    </div>
    <hr style="border: none; border-top: 1px solid ${COLORS.paleDogwood}; margin: 32px 0;" />
    <p style="margin: 0 0 12px 0; color: ${COLORS.mutedText}; font-size: 13px; text-align: center;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin: 0 0 24px 0; text-align: center;">
      <a href="${resetUrl}" style="color: ${COLORS.wine}; font-size: 12px; word-break: break-all;">${resetUrl}</a>
    </p>
    <p style="margin: 0; color: ${COLORS.mutedText}; font-size: 13px; text-align: center;">
      Didn't request a password reset? You can safely ignore this email.
    </p>
  `;

  const { error } = await resend.emails.send({
    from: "Leadly Security <security@leadly.live>",
    to: email,
    subject: "🔑 Reset your password - Leadly",
    html: wrapEmailContent(content, "Reset your Leadly password"),
  });

  if (error) {
    logger.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}

export async function sendSubscriptionActiveEmail(
  email: string,
  subscriptionId: string,
  periodEnd: Date,
) {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">🎉</span>
      </div>
      <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: ${COLORS.licorice};">You're All Set!</h2>
      <p style="margin: 0 0 24px 0; color: ${COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
        Your subscription is now <strong style="color: #16a34a;">active</strong> and ready to help you find amazing leads.
      </p>
      <div style="background: ${COLORS.linen}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; color: ${COLORS.mutedText}; font-size: 14px;">Your subscription is active until</p>
        <p style="margin: 0; color: ${COLORS.wine}; font-size: 20px; font-weight: 600;">${periodEnd.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <a href="${env.FRONTEND_URL}/dashboard" class="btn-primary" style="color: ${COLORS.white}; text-decoration: none;">
        Go to Dashboard
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid ${COLORS.paleDogwood}; margin: 32px 0;" />
    <p style="margin: 0; color: ${COLORS.mutedText}; font-size: 12px; text-align: center;">
      Subscription ID: ${subscriptionId}
    </p>
  `;

  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "🎉 Your subscription is active - Leadly",
    html: wrapEmailContent(content, "Welcome to Leadly Premium!"),
  });

  if (error) {
    logger.error("Failed to send subscription active email:", error);
  }
}

export async function sendSubscriptionOnHoldEmail(
  email: string,
  subscriptionId: string,
  periodEnd: Date,
) {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">⚠️</span>
      </div>
      <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: ${COLORS.licorice};">Subscription On Hold</h2>
      <p style="margin: 0 0 24px 0; color: ${COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
        There was an issue processing your payment. Your subscription is on hold until <strong>${periodEnd.toLocaleDateString()}</strong>.
      </p>
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: left;">
        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
          <strong>To continue using Leadly:</strong><br/>
          Go to Billing → Manage Subscription → Update your payment details in the Dodo Payments portal.
        </p>
      </div>
      <a href="${env.FRONTEND_URL}/settings/billing" class="btn-primary" style="color: ${COLORS.white}; text-decoration: none;">
        Update Payment Details
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid ${COLORS.paleDogwood}; margin: 32px 0;" />
    <p style="margin: 0; color: ${COLORS.mutedText}; font-size: 12px; text-align: center;">
      Subscription ID: ${subscriptionId}
    </p>
  `;

  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "⚠️ Your subscription is on hold - Leadly",
    html: wrapEmailContent(
      content,
      "Action required: Update your payment details",
    ),
  });

  if (error) {
    logger.error("Failed to send subscription on hold email:", error);
  }
}

export async function sendSubscriptionRenewedEmail(
  email: string,
  subscriptionId: string,
  periodEnd: Date,
) {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, ${COLORS.wine} 0%, ${COLORS.indianRed} 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">🔄</span>
      </div>
      <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: ${COLORS.licorice};">Subscription Renewed!</h2>
      <p style="margin: 0 0 24px 0; color: ${COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
        Great news! Your subscription has been successfully renewed. Keep finding those amazing leads!
      </p>
      <div style="background: ${COLORS.linen}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; color: ${COLORS.mutedText}; font-size: 14px;">Your subscription is now active until</p>
        <p style="margin: 0; color: ${COLORS.wine}; font-size: 20px; font-weight: 600;">${periodEnd.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <a href="${env.FRONTEND_URL}/dashboard" class="btn-primary" style="color: ${COLORS.white}; text-decoration: none;">
        Continue to Dashboard
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid ${COLORS.paleDogwood}; margin: 32px 0;" />
    <p style="margin: 0; color: ${COLORS.mutedText}; font-size: 12px; text-align: center;">
      Subscription ID: ${subscriptionId}
    </p>
  `;

  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "🔄 Your subscription is renewed - Leadly",
    html: wrapEmailContent(
      content,
      "Your Leadly subscription has been renewed",
    ),
  });

  if (error) {
    logger.error("Failed to send subscription renewed email:", error);
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

  const emoji =
    tier === SubscriptionTier.PREMIUM
      ? "👑"
      : tier === SubscriptionTier.PRO
        ? "⭐"
        : "📦";
  const planColor =
    tier === SubscriptionTier.PREMIUM
      ? "#7c3aed"
      : tier === SubscriptionTier.PRO
        ? COLORS.wine
        : COLORS.mutedText;

  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, ${planColor} 0%, ${COLORS.indianRed} 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">${emoji}</span>
      </div>
      <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: ${COLORS.licorice};">Plan Updated!</h2>
      <p style="margin: 0 0 24px 0; color: ${COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
        Your subscription plan has been updated.
      </p>
      <div style="background: ${COLORS.linen}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; color: ${COLORS.mutedText}; font-size: 14px;">Your new plan</p>
        <p style="margin: 0; color: ${planColor}; font-size: 28px; font-weight: 700;">${planName}</p>
      </div>
      <a href="${env.FRONTEND_URL}/dashboard" class="btn-primary" style="color: ${COLORS.white}; text-decoration: none;">
        Explore Your Features
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid ${COLORS.paleDogwood}; margin: 32px 0;" />
    <p style="margin: 0; color: ${COLORS.mutedText}; font-size: 12px; text-align: center;">
      Subscription ID: ${subscriptionId}
    </p>
  `;

  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: `${emoji} Your plan is now ${planName} - Leadly`,
    html: wrapEmailContent(
      content,
      `Your Leadly plan has been updated to ${planName}`,
    ),
  });

  if (error) {
    logger.error("Failed to send subscription plan changed email:", error);
  }
}

export async function sendSubscriptionCancelledEmail(
  email: string,
  subscriptionId: string,
) {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">👋</span>
      </div>
      <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: ${COLORS.licorice};">We're Sad to See You Go</h2>
      <p style="margin: 0 0 24px 0; color: ${COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
        Your subscription has been cancelled. You still have access to the Free plan features.
      </p>
      <div style="background: ${COLORS.linen}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="margin: 0 0 12px 0; color: ${COLORS.mutedText}; font-size: 14px;">Changed your mind?</p>
        <p style="margin: 0; color: ${COLORS.licorice}; font-size: 14px; line-height: 1.6;">
          You can reactivate your subscription anytime to get back all your premium features.
        </p>
      </div>
      <a href="${env.FRONTEND_URL}/settings/billing" class="btn-primary" style="color: ${COLORS.white}; text-decoration: none;">
        Reactivate Subscription
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid ${COLORS.paleDogwood}; margin: 32px 0;" />
    <p style="margin: 0; color: ${COLORS.mutedText}; font-size: 12px; text-align: center;">
      Subscription ID: ${subscriptionId}
    </p>
  `;

  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "👋 Your subscription is cancelled - Leadly",
    html: wrapEmailContent(
      content,
      "Your Leadly subscription has been cancelled",
    ),
  });

  if (error) {
    logger.error("Failed to send subscription cancelled email:", error);
  }
}

export async function sendSubscriptionExpiredEmail(
  email: string,
  subscriptionId: string,
) {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">⏰</span>
      </div>
      <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: ${COLORS.licorice};">Subscription Expired</h2>
      <p style="margin: 0 0 24px 0; color: ${COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
        Your subscription has expired. You've been moved to the Free plan with limited features.
      </p>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
          <strong>Don't miss out!</strong><br/>
          Reactivate now to continue finding high-quality leads for your business.
        </p>
      </div>
      <a href="${env.FRONTEND_URL}/settings/billing" class="btn-primary" style="color: ${COLORS.white}; text-decoration: none;">
        Reactivate Now
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid ${COLORS.paleDogwood}; margin: 32px 0;" />
    <p style="margin: 0; color: ${COLORS.mutedText}; font-size: 12px; text-align: center;">
      Subscription ID: ${subscriptionId}
    </p>
  `;

  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "⏰ Your subscription has expired - Leadly",
    html: wrapEmailContent(content, "Your Leadly subscription needs attention"),
  });

  if (error) {
    logger.error("Failed to send subscription expired email:", error);
  }
}

export async function sendSubscriptionFailedEmail(
  email: string,
  subscriptionId: string,
) {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">❌</span>
      </div>
      <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: ${COLORS.licorice};">Payment Failed</h2>
      <p style="margin: 0 0 24px 0; color: ${COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
        We couldn't process your payment. Don't worry, you can easily fix this!
      </p>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: left;">
        <p style="margin: 0 0 12px 0; color: #991b1b; font-size: 14px; font-weight: 600;">Common reasons:</p>
        <ul style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 14px; line-height: 1.6;">
          <li>Card expired or declined</li>
          <li>Insufficient funds</li>
          <li>Bank security block</li>
        </ul>
      </div>
      <a href="${env.FRONTEND_URL}/settings/billing" class="btn-primary" style="color: ${COLORS.white}; text-decoration: none;">
        Update Payment Details
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid ${COLORS.paleDogwood}; margin: 32px 0;" />
    <p style="margin: 0; color: ${COLORS.mutedText}; font-size: 12px; text-align: center;">
      Subscription ID: ${subscriptionId}
    </p>
  `;

  const { error } = await resend.emails.send({
    from: "Leadly Team <hello@leadly.live>",
    to: email,
    subject: "❌ Payment failed - Action required - Leadly",
    html: wrapEmailContent(content, "Your payment needs attention"),
  });

  if (error) {
    logger.error("Failed to send subscription failed email:", error);
  }
}
