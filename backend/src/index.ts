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
import { CRON_INTERVAL } from "./lib/constants";
import billingRouter from "./routes/billing";
import { dodoWebhookHandler } from "./controllers/webhooks";

const PORT = env.PORT;

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Important: register webhook raw-body route BEFORE json parser
app.post(
  "/api/v1/webhooks/dodo",
  express.raw({ type: "application/json" }),
  dodoWebhookHandler
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

const apiRouter = express.Router();

app.use("/api/v1", apiRouter);

apiRouter.use("/auth", authRouter);
apiRouter.use("/monitors", monitorRouter);
apiRouter.use("/icps", icpRouter);
apiRouter.use("/schedule", scheduleRouter);
apiRouter.use("/account", accountRouter);
apiRouter.use("/leads", leadRouter);
apiRouter.use("/monitors", scrapeJobsRouter);
apiRouter.use("/billing", billingRouter);

const scheduledTask = cron.schedule(CRON_INTERVAL, runScheduler, {
  timezone: "UTC",
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Scheduler started.");
});

const stopServer = () => {
  scheduledTask.stop();
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
