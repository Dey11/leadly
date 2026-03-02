import cors from "cors";
import { env } from "./env";
import logger from "./lib/logger";
import express, { type RequestHandler } from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { googleOAuthRouter } from "./routes/google-oauth";
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
import adminRouter from "./routes/admin";
import { requestLogger } from "./middleware/request-logger";
import { sendAllLogsToDiscord } from "./services/logger.service";
import { runKeywordScheduler } from "./services/keyword-scheduler";
import { blogRouter } from "./routes/blog";
import db from "./lib/db";
import { getRedis, closeRedis } from "./lib/redis";

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
app.use(cookieParser() as RequestHandler);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/health", async (req, res) => {
  const checks: { db: string; redis: string } = {
    db: "disconnected",
    redis: "disconnected",
  };

  try {
    await db.$queryRawUnsafe("SELECT 1");
    checks.db = "connected";
  } catch {
    checks.db = "disconnected";
  }

  try {
    const redis = getRedis();
    await redis.ping();
    checks.redis = "connected";
  } catch {
    checks.redis = "disconnected";
  }

  const healthy = checks.db === "connected" && checks.redis === "connected";
  res
    .status(healthy ? 200 : 503)
    .json({ status: healthy ? "ok" : "degraded", ...checks });
});

const apiRouter = express.Router();

app.use("/api/v1", apiRouter);

// Lead Gen routes
apiRouter.use("/blog", blogRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/auth", googleOAuthRouter);
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

// Admin routes (protected by API key)
apiRouter.use("/admin", adminRouter);

// Lead Gen scheduler (hourly at xx:00)
const leadGenScheduler = cron.schedule(CRON_INTERVAL, runScheduler, {
  timezone: "UTC",
});

const keywordScheduler = cron.schedule(
  KEYWORD_CRON_INTERVAL,
  runKeywordScheduler,
  {
    timezone: "UTC",
  },
);

// Hourly Log Report (at xx:00)
cron.schedule(
  "0 * * * *",
  async () => {
    logger.info("Running hourly log report");
    await sendAllLogsToDiscord("backend");
  },
  { timezone: "UTC" },
);

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info("Lead Gen Scheduler started (hourly at xx:00).");
  logger.info("Keyword Scheduler started (hourly at xx:30).");
});

const stopServer = async () => {
  leadGenScheduler.stop();
  keywordScheduler.stop();

  // Stop accepting new connections first, then close dependencies
  server.close(async () => {
    await closeRedis().catch(() => {});
    await db.$disconnect().catch(() => {});
    logger.info("Server closed.");
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    logger.warn("Forced exit after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => {
  logger.info("SIGINT received, stopping scheduler...");
  stopServer();
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, stopping scheduler...");
  stopServer();
});
