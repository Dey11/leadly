import { NextFunction, Request, Response } from "express";
import db from "../lib/db";

function getClearCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    domain: isProduction ? ".leadly.live" : undefined,
    maxAge: 0,
    path: "/",
  } as const;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionToken = req.cookies.session_token;
  if (!sessionToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const session = await db.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (session.user.isDeleted) {
    await db.session.delete({
      where: {
        token: sessionToken,
      },
    });
    return res
      .cookie("session_token", "", getClearCookieOptions())
      .status(401)
      .json({ error: "User is deleted" });
  }

  if (!session.user.emailVerified) {
    await db.session.delete({
      where: {
        token: sessionToken,
      },
    });
    return res
      .cookie("session_token", "", getClearCookieOptions())
      .status(403)
      .json({ error: "Email not verified", requiresVerification: true });
  }

  if (session.expiresAt < new Date()) {
    await db.session.delete({
      where: {
        token: sessionToken,
      },
    });
    return res.status(401).json({ error: "Session expired" });
  }

  req.userId = session.userId;

  next();
}
