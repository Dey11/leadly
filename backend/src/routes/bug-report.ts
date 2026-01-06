import { Router } from "express";
import { createBugReport, listBugReports } from "../controllers/bug-report";
import { authMiddleware } from "../middleware/auth";
import { userRateLimit } from "../lib/rate-limit";

const bugReportRouter = Router();

bugReportRouter.post("/", authMiddleware, userRateLimit("write"), createBugReport);
bugReportRouter.get("/", authMiddleware, userRateLimit("read"), listBugReports);

export default bugReportRouter;

