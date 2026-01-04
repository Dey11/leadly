import { Router } from "express";
import { createBugReport, listBugReports } from "../controllers/bug-report";
import { authMiddleware } from "../middleware/auth";

const bugReportRouter = Router();

bugReportRouter.post("/", authMiddleware, createBugReport);
bugReportRouter.get("/", authMiddleware, listBugReports);

export default bugReportRouter;
