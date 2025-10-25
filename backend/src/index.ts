import cors from "cors";
import { env } from "./env";
import express from "express";
import cron from "node-cron";
import { runScheduler } from "./services/scheduler";
import { authRouter } from "./routes/auth";
import monitorRouter from "./routes/monitor";
import serviceRouter from "./routes/service";
import scheduleRouter from "./routes/schedule";
import { accountRouter } from "./routes/account";

const PORT = env.PORT;

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

const apiRouter = express.Router();

app.use("/api/v1", apiRouter);

apiRouter.use(authRouter);
apiRouter.use("/monitors", monitorRouter);
apiRouter.use("/services", serviceRouter);
apiRouter.use("/schedule", scheduleRouter);
apiRouter.use("/account", accountRouter);

const scheduledTask = cron.schedule("0 * * * *", runScheduler); // every hour

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
