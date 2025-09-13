import { Router } from "express";
import { getUser } from "../controllers/user";

const userRouter = Router();

userRouter.get("/user", getUser);

export default userRouter;
