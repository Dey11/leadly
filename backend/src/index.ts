import cors from "cors";
import { env } from "./env";
import express from "express";
import cron from "node-cron";
import { runScheduler } from "./services/scheduler";
import { authRouter } from "./routes/auth";

const PORT = env.PORT;

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
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

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  const scheduledTask = cron.schedule('* * * * *', runScheduler);
  console.log('Scheduler started.');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, stopping scheduler...');
  const scheduledTask = cron.schedule('* * * * *', runScheduler);
  scheduledTask.stop();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, stopping scheduler...');
  const scheduledTask = cron.schedule('* * * * *', runScheduler);
  scheduledTask.stop();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
