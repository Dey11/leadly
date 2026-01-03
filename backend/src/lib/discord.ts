import { env } from "../env";
import type { BugReport, User } from "@prisma/client";

type BugReportWithUser = BugReport & { user: Pick<User, "email" | "name"> };

const SEVERITY_COLORS: Record<string, number> = {
  CRITICAL: 0xdc2626, // red
  HIGH: 0xf97316, // orange
  MEDIUM: 0xeab308, // yellow
  LOW: 0x22c55e, // green
};

const CATEGORY_LABELS: Record<string, string> = {
  BUG: "🐛 Bug",
  FEATURE_REQUEST: "✨ Feature Request",
  QUESTION: "❓ Question",
  OTHER: "📝 Other",
};

export async function sendBugReportToDiscord(
  report: BugReportWithUser,
): Promise<boolean> {
  const webhookUrl = env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("Discord webhook URL not configured, skipping notification");
    return false;
  }

  const color = report.severity
    ? SEVERITY_COLORS[report.severity] ?? 0x6b7280
    : 0x6b7280;

  const categoryLabel = CATEGORY_LABELS[report.category] ?? report.category;

  const embed = {
    title: `📋 ${report.title}`,
    description: report.description,
    color,
    fields: [
      {
        name: "Category",
        value: categoryLabel,
        inline: true,
      },
      {
        name: "Severity",
        value: report.severity ?? "Not specified",
        inline: true,
      },
      {
        name: "Status",
        value: report.status,
        inline: true,
      },
      {
        name: "Reported By",
        value: `${report.user.name} (${report.user.email})`,
        inline: false,
      },
      ...(report.pageUrl
        ? [
            {
              name: "Page URL",
              value: report.pageUrl,
              inline: false,
            },
          ]
        : []),
    ],
    footer: {
      text: `Report ID: ${report.id}`,
    },
    timestamp: report.createdAt.toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Leadly Bug Reports",
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error(
        "Failed to send Discord notification:",
        response.status,
        await response.text(),
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Discord notification:", error);
    return false;
  }
}
