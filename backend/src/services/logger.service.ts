import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import { env } from "../env";
import logger from "../lib/logger";

const LOGS_DIR = join(process.cwd(), "logs");

interface LogFileInfo {
  name: string;
  size: number;
  content: Buffer;
}

/**
 * Send all log files (combined + error) to Discord as file attachments.
 * This is called hourly by cron and on-demand via admin API.
 */
export async function sendAllLogsToDiscord(
  source: "backend" | "worker" = "backend",
): Promise<{ success: boolean; message: string; filesSent: number }> {
  const webhookUrl = env.DISCORD_LOGS_WEBHOOK_URL;
  if (!webhookUrl) {
    const msg = "DISCORD_LOGS_WEBHOOK_URL not configured, skipping log upload";
    logger.warn(msg);
    return { success: false, message: msg, filesSent: 0 };
  }

  try {
    const files = await readdir(LOGS_DIR);
    const logFiles: LogFileInfo[] = [];

    // Get all .log files (combined and error)
    for (const file of files) {
      if (file.endsWith(".log") && !file.includes(".audit.json")) {
        const filePath = join(LOGS_DIR, file);
        const stats = await stat(filePath);

        // Only include files with content
        if (stats.size > 0) {
          const content = await readFile(filePath);
          logFiles.push({
            name: file,
            size: stats.size,
            content,
          });
        }
      }
    }

    if (logFiles.length === 0) {
      const msg = `No log files found in ${source}`;
      logger.info(msg);
      return { success: true, message: msg, filesSent: 0 };
    }

    // Create FormData with all log files
    const formData = new FormData();
    const timestamp = new Date().toISOString();
    const sourceEmoji = source === "backend" ? "🖥️" : "⚙️";

    formData.append(
      "payload_json",
      JSON.stringify({
        username: "Leadly Log Bot",
        embeds: [
          {
            title: `${sourceEmoji} ${source.toUpperCase()} Logs`,
            description: `**Files:** ${logFiles.length}\n**Time:** ${timestamp}`,
            color: 3447003, // Blue
            fields: logFiles.map((f) => ({
              name: `📄 ${f.name}`,
              value: `${formatBytes(f.size)}`,
              inline: true,
            })),
            footer: { text: `Leadly ${source} logs` },
          },
        ],
      }),
    );

    // Attach each log file
    for (let i = 0; i < logFiles.length; i++) {
      const file = logFiles[i];
      const blob = new Blob([new Uint8Array(file.content)], {
        type: "text/plain",
      });
      formData.append(`file${i}`, blob, file.name);
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    const msg = `Sent ${logFiles.length} log files from ${source} to Discord`;
    logger.info(msg);
    return { success: true, message: msg, filesSent: logFiles.length };
  } catch (error) {
    const msg = `Error sending ${source} logs to Discord`;
    logger.error(msg, error);
    return { success: false, message: msg, filesSent: 0 };
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
