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

/**
 * Base auth middleware that allows both verified and unverified users.
 * Use this for read-only operations where unverified users should have access.
 * Sets req.userId and req.emailVerified for downstream use.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
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

  if (session.expiresAt < new Date()) {
    await db.session.delete({
      where: {
        token: sessionToken,
      },
    });
    return res.status(401).json({ error: "Session expired" });
  }

  req.userId = session.userId;
  req.emailVerified = session.user.emailVerified;

  next();
}

/**
 * Strict auth middleware that only allows verified users.
 * Use this for create/update/delete operations and billing.
 * Returns a specific error code that frontend can handle.
 */
export async function authMiddlewareVerifiedOnly(
  req: Request,
  res: Response,
  next: NextFunction,
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

  if (session.expiresAt < new Date()) {
    await db.session.delete({
      where: {
        token: sessionToken,
      },
    });
    return res.status(401).json({ error: "Session expired" });
  }

  // For verified-only middleware, block unverified users
  if (!session.user.emailVerified) {
    return res.status(403).json({
      error: "Email verification required to perform this action",
      code: "EMAIL_NOT_VERIFIED",
      action: "verify_email",
    });
  }

  req.userId = session.userId;
  req.emailVerified = session.user.emailVerified;

  next();
}
