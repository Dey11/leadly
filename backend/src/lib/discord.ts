import { env } from "../env";
import logger from "./logger";
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
    logger.warn("Discord webhook URL not configured, skipping notification");
    return false;
  }

  const color = report.severity
    ? (SEVERITY_COLORS[report.severity] ?? 0x6b7280)
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
      logger.error(
        "Failed to send Discord notification:",
        response.status,
        await response.text(),
      );
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Error sending Discord notification:", error);
    return false;
  }
}

const TRANSACTION_COLORS: Record<string, number> = {
  "subscription.active": 0x22c55e, // green
  "subscription.renewed": 0x3b82f6, // blue
  "subscription.plan_changed": 0xa855f7, // purple
  "subscription.cancelled": 0xf97316, // orange
  "subscription.on_hold": 0xeab308, // yellow
  "subscription.failed": 0xdc2626, // red
  "subscription.expired": 0xdc2626, // red
};

const TRANSACTION_TITLES: Record<string, string> = {
  "subscription.active": "🎉 New Subscription",
  "subscription.renewed": "🔄 Subscription Renewed",
  "subscription.upgraded": "⬆️ Plan Upgraded",
  "subscription.downgraded": "⬇️ Plan Downgraded",
  "subscription.plan_changed": "🔀 Plan Changed",
  "subscription.cancelled": "⚠️ Subscription Cancelled",
  "subscription.on_hold": "⏸️ Subscription On Hold",
  "subscription.failed": "❌ Payment Failed",
  "subscription.expired": "⏳ Subscription Expired",
};

export type TransactionDetails = {
  type: string;
  tier: string;
  oldTier?: string; // For plan changes - shows the previous tier
  user: {
    name: string;
    email: string;
  };
  subscriptionId?: string;
  periodEnd?: Date;
  amount?: string; // formatted string if available
};

export async function sendTransactionToDiscord(
  details: TransactionDetails,
): Promise<boolean> {
  const webhookUrl = env.DISCORD_PAYMENT_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
  }

  const color = TRANSACTION_COLORS[details.type] ?? 0x6b7280;
  let title = TRANSACTION_TITLES[details.type] ?? details.type;

  // For plan changes, determine if it's an upgrade or downgrade
  const tierOrder: Record<string, number> = { FREE: 0, PRO: 1, PREMIUM: 2 };
  if (details.type === "subscription.plan_changed" && details.oldTier) {
    const oldRank = tierOrder[details.oldTier] ?? 0;
    const newRank = tierOrder[details.tier] ?? 0;
    if (newRank > oldRank) {
      title = TRANSACTION_TITLES["subscription.upgraded"];
    } else if (newRank < oldRank) {
      title = TRANSACTION_TITLES["subscription.downgraded"];
    }
  }

  const embed = {
    title,
    color,
    fields: [
      {
        name: "User",
        value: `${details.user.name}\n${details.user.email}`,
        inline: true,
      },
      {
        name: "Plan",
        value: details.oldTier
          ? `${details.oldTier} → ${details.tier}`
          : details.tier,
        inline: true,
      },
      ...(details.periodEnd
        ? [
            {
              name: "Next Renewal",
              value: details.periodEnd.toDateString(),
              inline: true,
            },
          ]
        : []),
      ...(details.subscriptionId
        ? [
            {
              name: "Subscription ID",
              value: details.subscriptionId,
              inline: false,
            },
          ]
        : []),
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Leadly Billing",
    },
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Leadly Transactions",
        embeds: [embed],
      }),
    });
    return true;
  } catch (error) {
    logger.error("Error sending transaction notification:", error);
    return false;
  }
}

// =============================================================================
// PER-USER LEAD NOTIFICATIONS (NotificationChannel, type: DISCORD)
// =============================================================================
// Unlike the admin webhooks above (env-configured), these are sent to a
// per-user Discord webhook URL stored on their NotificationChannel row.

const LEADLY_BRAND_COLOR = 0x773344; // "Wine" - Leadly's primary brand color

const MAX_LEADS_IN_EMBED = 5;
const MAX_LEAD_CONTENT_LENGTH = 150;

function truncateContent(content: string): string {
  const singleLine = content.replace(/\s+/g, " ").trim();
  if (singleLine.length <= MAX_LEAD_CONTENT_LENGTH) return singleLine;
  return `${singleLine.slice(0, MAX_LEAD_CONTENT_LENGTH - 1)}…`;
}

export type DiscordLeadNotificationLead = {
  content: string;
  url: string;
};

export type DiscordLeadNotificationPayload = {
  /** e.g. "r/SaaS" or "list: someuser/leads" */
  monitorLabel: string;
  /** e.g. "2 WARM · 1 COLD · 3 NEUTRAL" or "5 keyword matches" */
  breakdown: string;
  /** Total number of qualifying leads (may exceed leads.length) */
  totalCount: number;
  leads: DiscordLeadNotificationLead[];
  dashboardUrl: string;
};

export async function sendDiscordLeadNotification(
  webhookUrl: string,
  payload: DiscordLeadNotificationPayload,
): Promise<boolean> {
  const shownLeads = payload.leads.slice(0, MAX_LEADS_IN_EMBED);
  const remaining = payload.totalCount - shownLeads.length;

  const description =
    shownLeads
      .map(
        (lead, index) =>
          `**${index + 1}.** ${truncateContent(lead.content)}\n[View on Reddit ↗](${lead.url})`,
      )
      .join("\n\n") || "No leads to display.";

  const embed = {
    title: `🎯 New leads from ${payload.monitorLabel}`,
    description,
    color: LEADLY_BRAND_COLOR,
    fields: [
      {
        name: "Breakdown",
        value: payload.breakdown,
        inline: false,
      },
      ...(remaining > 0
        ? [
            {
              name: "​",
              value: `**[+${remaining} more →](${payload.dashboardUrl})**`,
              inline: false,
            },
          ]
        : [
            {
              name: "​",
              value: `[View all leads →](${payload.dashboardUrl})`,
              inline: false,
            },
          ]),
    ],
    footer: {
      text: "Leadly",
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Leadly",
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      logger.error(
        "Failed to send Discord lead notification:",
        response.status,
        await response.text(),
      );
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Error sending Discord lead notification:", error);
    return false;
  }
}

export async function sendDiscordTestMessage(
  webhookUrl: string,
): Promise<boolean> {
  const embed = {
    title: "✅ Leadly notifications are connected",
    description:
      "This is a test message. When your monitors find new qualifying leads, you'll get an alert here.",
    color: LEADLY_BRAND_COLOR,
    footer: {
      text: "Leadly",
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Leadly",
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      logger.error(
        "Failed to send Discord test message:",
        response.status,
        await response.text(),
      );
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Error sending Discord test message:", error);
    return false;
  }
}
