import { Router } from "express";
import {
  createKeywordSet,
  deleteKeywordSet,
  getKeywordSet,
  getKeywordSets,
  updateKeywordSet,
} from "../controllers/keyword-set";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.post("/", createKeywordSet);
router.get("/", getKeywordSets);
router.get("/:id", getKeywordSet);
router.patch("/:id", updateKeywordSet);
router.delete("/:id", deleteKeywordSet);

export default router;
