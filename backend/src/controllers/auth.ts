import { Request, Response } from "express";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  formatZodError,
} from "../types/schema";
import db from "../lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { env } from "../env";
import { SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { initializeOrResetUsagePeriod } from "../lib/usage";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/email";
import { validateEmail } from "../lib/email-validator";
import { checkRateLimit, incrementRateLimit } from "../lib/rate-limit";

function generateSecureSessionToken(): string {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const timestamp = Date.now().toString();
  const data = `${randomBytes}:${timestamp}`;

  if (!env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  const hmac = crypto.createHmac("sha256", env.SESSION_SECRET);
  hmac.update(data);
  const signature = hmac.digest("hex");

  return `${data}:${signature}`;
}

async function createUserSession(userId: string) {
  const token = generateSecureSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  await db.session.deleteMany({
    where: {
      userId,
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return await db.session.create({
    data: {
      id: crypto.randomUUID(),
      token,
      userId,
      expiresAt,
    },
  });
}

function getCookieOptions(maxAge: number = 1000 * 60 * 60 * 24 * 7) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    domain: isProduction ? ".leadly.live" : undefined,
    maxAge,
    path: "/",
  } as const;
}

export async function register(req: Request, res: Response) {
  try {
    const payload = registerSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: formatZodError(payload.error) });
    }

    const email = payload.data.email.toLowerCase();
    const rateLimitCheck = await checkRateLimit(req, "register");
    if (rateLimitCheck.exceeded) {
      return res.status(429).json({
        error: rateLimitCheck.error,
        retryAfter: rateLimitCheck.retryAfter,
      });
    }

    const findExistingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (findExistingUser?.isDeleted) {
      return res.status(400).json({ error: "User is deleted" });
    }

    if (findExistingUser && findExistingUser.emailVerified) {
      return res.status(400).json({ error: "User already exists" });
    }

    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.reason });
    }

    const hashedPassword = await bcrypt.hash(payload.data.password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // If unverified user exists, update instead of delete to prevent race condition
    if (findExistingUser && !findExistingUser.emailVerified) {
      const token = generateSecureSessionToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const { user, session } = await db.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: findExistingUser.id },
          data: {
            name: payload.data.name,
            passwordHash: hashedPassword,
            emailOtp: otp,
            emailOtpExpiresAt: otpExpiresAt,
          },
        });

        await tx.session.deleteMany({ where: { userId: user.id } });

        const session = await tx.session.create({
          data: {
            id: crypto.randomUUID(),
            token,
            userId: user.id,
            expiresAt,
          },
        });

        return { user, session };
      });

      try {
        await sendVerificationEmail(email, otp);
        await incrementRateLimit(req, "register");
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }

      return res
        .cookie("session_token", session.token, getCookieOptions())
        .status(200)
        .json({ message: "Verification email resent", email: user.email });
    }

    const { user, session } = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: payload.data.name,
          email,
          passwordHash: hashedPassword as string,
          emailOtp: otp,
          emailOtpExpiresAt: otpExpiresAt,
        },
      });

      const token = generateSecureSessionToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await tx.session.deleteMany({
        where: {
          userId: user.id,
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      const session = await tx.session.create({
        data: {
          id: crypto.randomUUID(),
          token,
          userId: user.id,
          expiresAt,
        },
      });

      await tx.subscription.create({
        data: {
          userId: user.id,
          status: SubscriptionStatus.ACTIVE,
          tier: SubscriptionTier.FREE,
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      await initializeOrResetUsagePeriod(tx, user.id, SubscriptionTier.FREE);

      await tx.userSchedule.create({
        data: {
          userId: user.id,
          scheduledHours: [12],
        },
      });

      return { user, session };
    });

    try {
      await sendVerificationEmail(email, otp);
      await incrementRateLimit(req, "register");
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    res
      .cookie("session_token", session.token, getCookieOptions())
      .status(201)
      .json({ message: "User created successfully", email: user.email });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const payload = loginSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: formatZodError(payload.error) });
    }

    const email = payload.data.email.toLowerCase();

    const userInDb = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!userInDb) {
      await bcrypt.compare(
        payload.data.password,
        "$2b$10$dummyhashtopreventtimingattacks",
      );
      return res.status(400).json({ error: "Invalid email or password" });
    }
    if (userInDb?.isDeleted) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(
      payload.data.password,
      userInDb.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!userInDb.emailVerified) {
      const rateLimitCheck = await checkRateLimit(req, "resendOtp");
      if (rateLimitCheck.exceeded) {
        return res.status(429).json({
          error: rateLimitCheck.error,
          retryAfter: rateLimitCheck.retryAfter,
        });
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await db.user.update({
        where: { id: userInDb.id },
        data: { emailOtp: otp, emailOtpExpiresAt: otpExpiresAt },
      });

      try {
        await sendVerificationEmail(userInDb.email, otp);
        await incrementRateLimit(req, "resendOtp");
      } catch (e) {
        console.error("Failed to resend verification email:", e);
      }

      return res.status(403).json({
        error: "Email not verified",
        requiresVerification: true,
        email: userInDb.email,
      });
    }

    const session = await createUserSession(userInDb.id);

    res
      .cookie("session_token", session.token, getCookieOptions())
      .status(200)
      .json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const sessionToken = req.cookies.session_token;
    if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await db.session.deleteMany({
      where: {
        token: sessionToken,
      },
    });

    res
      .cookie("session_token", "", getCookieOptions(0))
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    console.error("LOGOUT_ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const payload = verifyEmailSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: formatZodError(payload.error) });
    }

    const email = payload.data.email.toLowerCase();

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.isDeleted) {
      return res.status(400).json({ error: "User is deleted" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    if (!user.emailOtp || !user.emailOtpExpiresAt) {
      return res.status(400).json({ error: "No verification code found" });
    }

    if (new Date() > user.emailOtpExpiresAt) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    if (user.emailOtp !== payload.data.otp) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailOtp: null,
        emailOtpExpiresAt: null,
      },
    });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function resendVerificationEmail(req: Request, res: Response) {
  try {
    const payload = resendVerificationEmailSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: formatZodError(payload.error) });
    }

    const email = payload.data.email.toLowerCase();

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.isDeleted) {
      return res.status(400).json({ error: "User is deleted" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const rateLimitCheck = await checkRateLimit(req, "resendOtp");
    if (rateLimitCheck.exceeded) {
      return res.status(429).json({
        error: rateLimitCheck.error,
        retryAfter: rateLimitCheck.retryAfter,
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        emailOtp: otp,
        emailOtpExpiresAt: otpExpiresAt,
      },
    });

    try {
      await sendVerificationEmail(user.email, otp);
      await incrementRateLimit(req, "resendOtp");
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return res.status(500).json({ error: "Failed to send email" });
    }

    res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Resend verification email failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const payload = forgotPasswordSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: formatZodError(payload.error) });
    }

    const email = payload.data.email.toLowerCase();

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || user.isDeleted) {
      return res
        .status(200)
        .json({ message: "If an account exists, a reset link has been sent" });
    }

    const rateLimitCheck = await checkRateLimit(req, "forgotPassword");
    if (rateLimitCheck.exceeded) {
      return res.status(429).json({
        error: rateLimitCheck.error,
        retryAfter: rateLimitCheck.retryAfter,
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiresAt,
      },
    });

    try {
      await sendPasswordResetEmail(user.email, resetToken);
      await incrementRateLimit(req, "forgotPassword");
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
    }

    res
      .status(200)
      .json({ message: "If an account exists, a reset link has been sent" });
  } catch (error) {
    console.error("Forgot password failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const payload = resetPasswordSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: formatZodError(payload.error) });
    }

    const user = await db.user.findUnique({
      where: { resetToken: payload.data.token },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    if (user.isDeleted) {
      return res.status(400).json({ error: "User is deleted" });
    }

    if (!user.resetTokenExpiresAt || new Date() > user.resetTokenExpiresAt) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    const isSamePassword = await bcrypt.compare(
      payload.data.password,
      user.passwordHash,
    );
    if (isSamePassword) {
      return res
        .status(400)
        .json({ error: "New password cannot be the same as the old password" });
    }

    const hashedPassword = await bcrypt.hash(payload.data.password, 10);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    await db.session.deleteMany({
      where: { userId: user.id },
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
