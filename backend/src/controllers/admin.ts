import type { Request, Response } from "express";
import { readdir, readFile, stat } from "fs/promises";
import { join, basename } from "path";
import { env } from "../env";
import logger from "../lib/logger";

const LOGS_DIR = join(process.cwd(), "logs");

interface LogFile {
  name: string;
  size: number;
  modified: string;
}

/**
 * GET /api/v1/admin/logs
 * List all available log files
 */
export async function getLogFiles(req: Request, res: Response) {
  try {
    const files = await readdir(LOGS_DIR);
    const logFiles: LogFile[] = [];

    for (const file of files) {
      if (file.endsWith(".log") || file.endsWith(".log.gz")) {
        const filePath = join(LOGS_DIR, file);
        const stats = await stat(filePath);
        logFiles.push({
          name: file,
          size: stats.size,
          modified: stats.mtime.toISOString(),
        });
      }
    }

    // Sort by modified date, newest first
    logFiles.sort(
      (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime(),
    );

    res.json({ files: logFiles });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return res.json({ files: [], message: "No logs directory found" });
    }
    logger.error("Error listing log files:", error);
    res.status(500).json({ error: "Failed to list log files" });
  }
}

/**
 * GET /api/v1/admin/logs/:filename
 * Download a specific log file
 */
export async function downloadLogFile(req: Request, res: Response) {
  const { filename } = req.params;

  // Security: only allow log files, prevent directory traversal
  const sanitizedFilename = basename(filename);
  if (
    !sanitizedFilename.endsWith(".log") &&
    !sanitizedFilename.endsWith(".log.gz")
  ) {
    return res.status(400).json({ error: "Invalid file type" });
  }

  const filePath = join(LOGS_DIR, sanitizedFilename);

  try {
    await stat(filePath); // Check if file exists
    res.download(filePath, sanitizedFilename);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "Log file not found" });
    }
    logger.error("Error downloading log file:", error);
    res.status(500).json({ error: "Failed to download log file" });
  }
}

/**
 * POST /api/v1/admin/logs/discord
 * Send recent logs to Discord webhook
 */
export async function sendLogsToDiscord(req: Request, res: Response) {
  const { level = "combined", lines = 50 } = req.body;

  const webhookUrl = env.DISCORD_LOGS_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(400).json({
      error: "DISCORD_LOGS_WEBHOOK_URL not configured",
    });
  }

  try {
    // Find the most recent log file of the specified type
    const files = await readdir(LOGS_DIR);
    const logType = level === "error" ? "error" : "combined";
    const matchingFiles = files
      .filter((f) => f.startsWith(logType) && f.endsWith(".log"))
      .sort()
      .reverse();

    if (matchingFiles.length === 0) {
      return res.status(404).json({ error: `No ${logType} log files found` });
    }

    const latestLogFile = matchingFiles[0];
    const filePath = join(LOGS_DIR, latestLogFile);
    const content = await readFile(filePath, "utf-8");

    // Get the last N lines
    const allLines = content.trim().split("\n");
    const lastLines = allLines.slice(-Math.min(lines, 100)); // Cap at 100 lines for safety

    // Discord has 2000 char limit per message, split if needed
    const logContent = lastLines.join("\n");
    const chunks: string[] = [];

    // Split into chunks of ~1900 chars to be safe
    let currentChunk = "";
    for (const line of lastLines) {
      if (currentChunk.length + line.length + 1 > 1900) {
        chunks.push(currentChunk);
        currentChunk = line;
      } else {
        currentChunk += (currentChunk ? "\n" : "") + line;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }

    // Send to Discord
    const timestamp = new Date().toISOString();
    const header = `📋 **Leadly ${logType.toUpperCase()} Logs**\n📁 File: \`${latestLogFile}\`\n🕐 Requested: ${timestamp}\n${"─".repeat(40)}`;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Leadly Logs",
        content: header,
      }),
    });

    for (let i = 0; i < chunks.length; i++) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Leadly Logs",
          content: `\`\`\`\n${chunks[i]}\n\`\`\``,
        }),
      });

      // Small delay to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    logger.info(`Sent ${lastLines.length} lines of ${logType} logs to Discord`);

    res.json({
      success: true,
      message: `Sent ${lastLines.length} lines from ${latestLogFile} to Discord`,
      chunks: chunks.length,
    });
  } catch (error: any) {
    logger.error("Error sending logs to Discord:", error);
    res.status(500).json({ error: "Failed to send logs to Discord" });
  }
}
