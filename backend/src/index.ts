import cors from "cors";
import { env } from "./env";
import logger from "./lib/logger";
import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import monitorRouter from "./routes/monitor";
import icpRouter from "./routes/icp";
import scheduleRouter from "./routes/schedule";
import { accountRouter } from "./routes/account";
import leadRouter from "./routes/lead";
import scrapeJobsRouter from "./routes/scrape-jobs";
import billingRouter from "./routes/billing";
import bugReportRouter from "./routes/bug-report";
import { newDodoWebhookHandler } from "./controllers/webhooks-new";
import cron from "node-cron";
import { CRON_INTERVAL, KEYWORD_CRON_INTERVAL } from "./lib/constants";
import { runScheduler } from "./services/scheduler";
import keywordSetRouter from "./routes/keyword-set";
import keywordScheduleRouter from "./routes/keyword-schedule";
import keywordStatsRouter from "./routes/keyword-stats";
import keywordMonitorRouter from "./routes/keyword-monitor";
import keywordLeadRouter from "./routes/keyword-lead";
import { requestLogger } from "./middleware/request-logger";

const PORT = env.PORT;

const app = express();
app.set("trust proxy", 1);

app.use(requestLogger);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

// Important: register webhook raw-body route BEFORE json parser
app.post(
  "/api/v1/webhooks/dodo",
  express.raw({ type: "application/json" }),
  // dodoWebhookHandler,
  newDodoWebhookHandler,
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

const apiRouter = express.Router();

app.use("/api/v1", apiRouter);

// Lead Gen routes
apiRouter.use("/auth", authRouter);
apiRouter.use("/monitors", monitorRouter);
apiRouter.use("/icps", icpRouter);
apiRouter.use("/schedule", scheduleRouter);
apiRouter.use("/account", accountRouter);
apiRouter.use("/leads", leadRouter);
apiRouter.use("/monitors", scrapeJobsRouter);
apiRouter.use("/billing", billingRouter);
apiRouter.use("/bug-reports", bugReportRouter);

// Keyword mode routes
apiRouter.use("/keyword-sets", keywordSetRouter);
apiRouter.use("/keyword-schedule", keywordScheduleRouter);
apiRouter.use("/keyword-stats", keywordStatsRouter);
apiRouter.use("/keyword-monitors", keywordMonitorRouter);
apiRouter.use("/keyword-leads", keywordLeadRouter);

// Lead Gen scheduler (hourly at xx:00)
const leadGenScheduler = cron.schedule(CRON_INTERVAL, runScheduler, {
  timezone: "UTC",
});

// Keyword scheduler (hourly at xx:30)
import { runKeywordScheduler } from "./services/keyword-scheduler";
const keywordScheduler = cron.schedule(
  KEYWORD_CRON_INTERVAL,
  runKeywordScheduler,
  {
    timezone: "UTC",
  },
);

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info("Lead Gen Scheduler started (hourly at xx:00).");
  logger.info("Keyword Scheduler started (hourly at xx:30).");
});

const stopServer = () => {
  leadGenScheduler.stop();
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  logger.info("SIGINT received, stopping scheduler...");
  stopServer();
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, stopping scheduler...");
  stopServer();
});
