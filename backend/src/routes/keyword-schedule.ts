import { Router } from "express";
import {
  createKeywordSchedule,
  getKeywordSchedule,
  updateKeywordSchedule,
} from "../controllers/keyword-schedule";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", getKeywordSchedule);
router.post("/", createKeywordSchedule);
router.patch("/", updateKeywordSchedule);

export default router;
