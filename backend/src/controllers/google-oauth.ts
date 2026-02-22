import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import db from "../lib/db";
import { env } from "../env";
import { getCookieOptions } from "./auth";
import logger from "../lib/logger";
import { SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { initializeOrResetUsagePeriod } from "../lib/usage";

const oauth2Client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
);

// Reuses the same session token generation logic from auth.ts
// Duplicated here to allow transactional session creation with `tx`
function generateSecureSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

const MAX_SESSIONS = 5;

/**
 * Creates a session within a Prisma transaction client.
 * This ensures atomicity — if any part of the transaction fails,
 * the session is also rolled back.
 */
async function createSessionInTransaction(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  userId: string,
) {
  const token = generateSecureSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Clean up expired sessions
  await tx.session.deleteMany({
    where: {
      userId,
      expiresAt: { lt: new Date() },
    },
  });

  // Cap active sessions
  const activeSessions = await tx.session.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (activeSessions.length >= MAX_SESSIONS - 1) {
    const idsToKeep = activeSessions
      .slice(0, MAX_SESSIONS - 1)
      .map((s) => s.id);
    await tx.session.deleteMany({
      where: { userId, id: { notIn: idsToKeep } },
    });
  }

  return await tx.session.create({
    data: {
      id: crypto.randomUUID(),
      token,
      userId,
      expiresAt,
    },
  });
}

/**
 * GET /api/v1/auth/google
 * Initiates the Google OAuth 2.0 Authorization Code Flow.
 * Generates a CSRF-safe state parameter, stores it in a cookie,
 * and redirects the user to Google's consent screen.
 *
 * Source: https://developers.google.com/identity/protocols/oauth2/web-server
 */
export async function googleOAuthInitiate(req: Request, res: Response) {
  try {
    // Generate cryptographically random state for CSRF protection
    const state = crypto.randomBytes(32).toString("hex");

    // Store state in a short-lived httpOnly cookie (10 minutes)
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      domain: isProduction ? ".leadly.live" : undefined,
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: "/",
    });

    // Generate the Google authorization URL
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      include_granted_scopes: true,
      state: state,
      prompt: "consent",
    });

    res.redirect(authorizationUrl);
  } catch (error) {
    logger.error("Google OAuth initiation failed:", error);
    res.redirect(`${env.FRONTEND_URL}/login?error=oauth_initiation_failed`);
  }
}

/**
 * GET /api/v1/auth/google/callback
 * Handles the callback from Google's OAuth 2.0 server.
 * Validates state, exchanges code for tokens, verifies ID token,
 * and creates/links user accounts.
 */
export async function googleOAuthCallback(req: Request, res: Response) {
  try {
    const { code, state, error: oauthError } = req.query;

    // Handle error response from Google
    if (oauthError) {
      logger.warn("Google OAuth error response:", oauthError);
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_denied`);
    }

    // CRITICAL: Validate state parameter to prevent CSRF attacks
    const storedState = req.cookies?.oauth_state;
    if (!state || !storedState || state !== storedState) {
      logger.warn("OAuth state mismatch. Possible CSRF attack.");
      return res.redirect(
        `${env.FRONTEND_URL}/login?error=oauth_state_mismatch`,
      );
    }

    // Clear the state cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("oauth_state", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      domain: isProduction ? ".leadly.live" : undefined,
      maxAge: 0,
      path: "/",
    });

    if (!code || typeof code !== "string") {
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_no_code`);
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.id_token) {
      logger.error("No id_token received from Google");
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Verify the ID token using Google's public keys
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      logger.error("Empty payload from Google ID token");
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // The 'sub' claim is the stable unique user identifier — use this, NOT email
    const googleUserId = payload.sub;
    const email = payload.email?.toLowerCase();
    const emailVerified = payload.email_verified ?? false;
    const hd = payload.hd;
    const name = payload.name ?? email ?? "Google User";
    const picture = payload.picture;

    if (!email) {
      logger.error("No email in Google ID token payload");
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_no_email`);
    }

    // ── Account Linking Logic ──

    // Step 1: Check for existing OAuth link
    const existingAccount = await db.account.findFirst({
      where: { providerId: "google", accountId: googleUserId },
    });

    if (existingAccount) {
      // User already linked — log them in
      const user = await db.user.findUnique({
        where: { id: existingAccount.userId },
      });

      if (!user || user.isDeleted) {
        return res.redirect(
          `${env.FRONTEND_URL}/login?error=oauth_account_deleted`,
        );
      }

      // Update tokens if provided
      await db.account.update({
        where: { id: existingAccount.id },
        data: {
          accessToken: tokens.access_token ?? existingAccount.accessToken,
          refreshToken: tokens.refresh_token ?? existingAccount.refreshToken,
          idToken: tokens.id_token ?? existingAccount.idToken,
          accessTokenExpiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : existingAccount.accessTokenExpiresAt,
          scope: tokens.scope ?? existingAccount.scope,
        },
      });

      const session = await createSessionInTransaction(db as any, user.id);
      return res
        .cookie("session_token", session.token, getCookieOptions())
        .redirect(`${env.FRONTEND_URL}/dashboard`);
    }

    // Step 2: Check if email already exists in the system
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.isDeleted) {
        return res.redirect(
          `${env.FRONTEND_URL}/login?error=oauth_account_deleted`,
        );
      }

      // Security check: Is Google authoritative for this email?
      const isGoogleAuthoritative =
        email.endsWith("@gmail.com") ||
        email.endsWith("@googlemail.com") ||
        (emailVerified === true && hd !== undefined);

      if (!isGoogleAuthoritative) {
        return res.redirect(
          `${env.FRONTEND_URL}/login?error=oauth_email_exists`,
        );
      }

      // Safe to auto-link — wrap in transaction for atomicity
      const session = await db.$transaction(async (tx) => {
        await tx.account.create({
          data: {
            id: crypto.randomUUID(),
            providerId: "google",
            accountId: googleUserId,
            userId: existingUser.id,
            accessToken: tokens.access_token ?? null,
            refreshToken: tokens.refresh_token ?? null,
            idToken: tokens.id_token ?? null,
            accessTokenExpiresAt: tokens.expiry_date
              ? new Date(tokens.expiry_date)
              : null,
            scope: tokens.scope ?? null,
          },
        });

        // Mark email as verified since Google confirmed it
        if (!existingUser.emailVerified) {
          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              emailVerified: true,
              emailOtp: null,
              emailOtpExpiresAt: null,
            },
          });
        }

        return await createSessionInTransaction(tx, existingUser.id);
      });

      return res
        .cookie("session_token", session.token, getCookieOptions())
        .redirect(`${env.FRONTEND_URL}/dashboard`);
    }

    // Step 3: New user — create User + Account + Subscription + Usage + Schedule
    // All inside a single transaction for atomicity
    const session = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: "", // No password for OAuth-only users
          emailVerified: true, // Google verified the email
          image: picture ?? null,
        },
      });

      await tx.account.create({
        data: {
          id: crypto.randomUUID(),
          providerId: "google",
          accountId: googleUserId,
          userId: newUser.id,
          accessToken: tokens.access_token ?? null,
          refreshToken: tokens.refresh_token ?? null,
          idToken: tokens.id_token ?? null,
          accessTokenExpiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null,
          scope: tokens.scope ?? null,
        },
      });

      await tx.subscription.create({
        data: {
          userId: newUser.id,
          status: SubscriptionStatus.ACTIVE,
          tier: SubscriptionTier.FREE,
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      await initializeOrResetUsagePeriod(tx, newUser.id, SubscriptionTier.FREE);

      await tx.userSchedule.create({
        data: {
          userId: newUser.id,
          scheduledHours: [12],
        },
      });

      return await createSessionInTransaction(tx, newUser.id);
    });

    return res
      .cookie("session_token", session.token, getCookieOptions())
      .redirect(`${env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    logger.error("Google OAuth callback failed:", error);
    return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }
}
