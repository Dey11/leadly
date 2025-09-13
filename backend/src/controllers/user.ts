import { Request, Response } from "express";
import { getUser as getUserRepository } from "../repositories/user";

export async function getUser(req: Request, res: Response) {
  try {
    // const session = await auth.api.getSession({
    //   headers: fromNodeHeaders(req.headers as any),
    // });
    // if (!session?.user?.id) {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }
    // const user = await getUserRepository(session?.user?.id);
    // if (!user) {
    //   return res.status(404).json({ error: "User not found" });
    // }
    // res.status(200).json({
    //   message: "User fetched successfully",
    //   payload: user,
    // });
  } catch (error) {
    // res.status(500).json({ error: "Internal server error" });
  }
}
