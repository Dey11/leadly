import { Request, Response } from "express";
import { registerSchema } from "../types/schema";
import db from "../lib/db";
import bcrypt from "bcrypt";

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

    res
      .status(201)
      .json({ message: "User created successfully", payload: user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
