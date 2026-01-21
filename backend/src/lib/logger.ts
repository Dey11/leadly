import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "../env";

// Side-effect import - register transport with winston
void DailyRotateFile;

const { combine, timestamp, json, colorize, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const transports: winston.transport[] = [];

if (env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (
            Object.keys(metadata).length > 0 &&
            metadata.service === "leadly-backend"
          ) {
            // Remove default meta from verbose output in dev
            delete metadata.service;
          }
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        }),
      ),
    }),
  );
} else {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "error",
      format: combine(timestamp(), json()),
    }),
  );
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: combine(timestamp(), json()),
    }),
  );
}

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: json(),
  defaultMeta: { service: "leadly-backend" },
  transports,
});

export default logger;
