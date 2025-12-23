import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../types/schema";
import db from "../lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { env } from "../env";
import { SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { initializeOrResetUsagePeriod } from "../lib/usage";

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

export async function register(req: Request, res: Response) {
  try {
    const payload = registerSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: payload.error.message });
    }

    const findExistingUser = await db.user.findUnique({
      where: {
        email: payload.data.email,
      },
    });

    if (findExistingUser?.isDeleted) {
      return res.status(400).json({ error: "User is deleted" });
    }

    if (findExistingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(payload.data.password, 10);

    const { user, session } = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: payload.data.name,
          email: payload.data.email,
          passwordHash: hashedPassword as string,
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

    res
      .cookie("session_token", session.token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: ".leadly.live",
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: "/",
      })
      .status(201)
      .json({ message: "User created successfully" });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const payload = loginSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: payload.error.message });
    }

    const userInDb = await db.user.findUnique({
      where: {
        email: payload.data.email,
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

    const session = await createUserSession(userInDb.id);

    res
      .cookie("session_token", session.token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: ".leadly.live",
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: "/",
      })
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
      .cookie("session_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: ".leadly.live",
        maxAge: 0,
        path: "/",
      })
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
