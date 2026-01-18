import cors from "cors";
import { env } from "./env";
import express from "express";
import cron from "node-cron";
import cookieParser from "cookie-parser";
import { runScheduler } from "./services/scheduler";
import { authRouter } from "./routes/auth";
import monitorRouter from "./routes/monitor";
import icpRouter from "./routes/icp";
import scheduleRouter from "./routes/schedule";
import { accountRouter } from "./routes/account";
import leadRouter from "./routes/lead";
import scrapeJobsRouter from "./routes/scrape-jobs";
import { CRON_INTERVAL, KEYWORD_CRON_INTERVAL } from "./lib/constants";
import billingRouter from "./routes/billing";
import bugReportRouter from "./routes/bug-report";
import keywordSetRouter from "./routes/keyword-set";
import keywordScheduleRouter from "./routes/keyword-schedule";
import keywordStatsRouter from "./routes/keyword-stats";
import keywordMonitorRouter from "./routes/keyword-monitor";
import keywordLeadRouter from "./routes/keyword-lead";
import { dodoWebhookHandler } from "./controllers/webhooks";

const PORT = env.PORT;

const app = express();
app.set("trust proxy", 1);

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
  dodoWebhookHandler,
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
  console.log(`Server is running on port ${PORT}`);
  console.log("Lead Gen Scheduler started (hourly at xx:00).");
  console.log("Keyword Scheduler started (hourly at xx:30).");
});

const stopServer = () => {
  leadGenScheduler.stop();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  console.log("SIGINT received, stopping scheduler...");
  stopServer();
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, stopping scheduler...");
  stopServer();
});
