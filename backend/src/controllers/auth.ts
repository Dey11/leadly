import { Request, Response } from "express";
import { registerSchema, loginSchema, verifyEmailSchema, resendVerificationEmailSchema, forgotPasswordSchema, resetPasswordSchema, requestEmailChangeSchema, confirmEmailChangeSchema, formatZodError } from "../types/schema";
import db from "../lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { env } from "../env";
import { SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { initializeOrResetUsagePeriod } from "../lib/usage";
import { sendVerificationEmail, sendPasswordResetEmail, sendEmailChangeEmail } from "../lib/email";
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

    if (findExistingUser && !findExistingUser.emailVerified) {
      await db.user.delete({ where: { id: findExistingUser.id } });
    }

    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.reason });
    }

    const rateLimitCheck = await checkRateLimit(req, "register");
    if (rateLimitCheck.exceeded) {
      return res.status(429).json({
        error: rateLimitCheck.error,
        retryAfter: rateLimitCheck.retryAfter,
      });
    }

    const hashedPassword = await bcrypt.hash(payload.data.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

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
      return res.status(400).json({ error: "User not found" });
    }
    if (userInDb?.isDeleted) {
      return res.status(400).json({ error: "User is deleted" });
    }

    const isPasswordValid = await bcrypt.compare(
      payload.data.password,
      userInDb.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    if (!userInDb.emailVerified) {
      const rateLimitCheck = await checkRateLimit(req, "resendOtp");
      if (rateLimitCheck.exceeded) {
        return res.status(429).json({
          error: rateLimitCheck.error,
          retryAfter: rateLimitCheck.retryAfter,
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
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

    await db.session.delete({
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
      return res.status(200).json({ message: "If an account exists, a reset link has been sent" });
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

    res.status(200).json({ message: "If an account exists, a reset link has been sent" });
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

    const isSamePassword = await bcrypt.compare(payload.data.password, user.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({ error: "New password cannot be the same as the old password" });
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

export async function requestEmailChange(req: Request, res: Response) {
  try {
    const payload = requestEmailChangeSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: formatZodError(payload.error) });
    }

    const sessionToken = req.cookies.session_token;
    if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "Session expired" });
    }

    const user = session.user;

    if (user.isDeleted) {
      return res.status(403).json({ error: "User is deleted" });
    }

    const { newEmail, password } = payload.data;

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      return res.status(400).json({ error: "New email must be different from current email" });
    }

    const existingUser = await db.user.findUnique({
      where: { email: newEmail.toLowerCase() },
    });
    if (existingUser) {
      return res.status(400).json({ error: "This email is already in use" });
    }

    const emailValidation = await validateEmail(newEmail);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.reason });
    }

    const rateLimitCheck = await checkRateLimit(req, "requestEmailChange");
    if (rateLimitCheck.exceeded) {
      return res.status(429).json({
        error: rateLimitCheck.error,
        retryAfter: rateLimitCheck.retryAfter,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        pendingEmail: newEmail.toLowerCase(),
        emailChangeToken: token,
        emailChangeTokenExpiresAt: expiresAt,
      },
    });

    await sendEmailChangeEmail(newEmail, token);
    await incrementRateLimit(req, "requestEmailChange");

    res.status(200).json({ message: "Confirmation email sent to new address" });
  } catch (error) {
    console.error("Email change request failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function confirmEmailChange(req: Request, res: Response) {
  try {
    const payload = confirmEmailChangeSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: formatZodError(payload.error) });
    }

    const user = await db.user.findUnique({
      where: { emailChangeToken: payload.data.token },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (user.isDeleted) {
      return res.status(400).json({ error: "User is deleted" });
    }

    if (!user.emailChangeTokenExpiresAt || user.emailChangeTokenExpiresAt < new Date()) {
      return res.status(400).json({ error: "Token has expired" });
    }

    if (!user.pendingEmail) {
      return res.status(400).json({ error: "No pending email change" });
    }

    const emailTaken = await db.user.findUnique({
      where: { email: user.pendingEmail },
    });

    if (emailTaken) {
      return res.status(400).json({ error: "This email is already in use" });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeTokenExpiresAt: null,
      },
    });

    await db.session.deleteMany({
      where: { userId: user.id },
    });

    res.status(200).json({ message: "Email changed successfully" });
  } catch (error) {
    console.error("Email change confirmation failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
