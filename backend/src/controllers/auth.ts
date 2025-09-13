import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../types/schema";
import db from "../lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { env } from "../env";

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

    if (findExistingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(payload.data.password, 10);

    const user = await db.user.create({
      data: {
        name: payload.data.name,
        email: payload.data.email,
        passwordHash: hashedPassword as string,
      },
    });

    const session = await createUserSession(user.id);

    res
      .cookie("session_token", session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: "/",
      })
      .status(201)
      .json({ message: "User created successfully", payload: user });
  } catch (error) {
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
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: "/",
      })
      .status(200)
      .json({ message: "Login successful", payload: session });
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
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      })
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
