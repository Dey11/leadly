import { Router } from "express";
import { getKeywordStats } from "../controllers/keyword-stats";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", getKeywordStats);

export default router;
