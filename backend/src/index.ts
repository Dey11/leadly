import cors from "cors";
import { env } from "./env";
import express from "express";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";

const PORT = env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
