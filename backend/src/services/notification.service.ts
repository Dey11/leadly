import db from "../lib/db";
import logger from "../lib/logger";
import { env } from "../env";
import { TIER_LIMITS } from "../lib/constants";
import {
  sendDiscordLeadNotification,
  sendDiscordTestMessage,
} from "../lib/discord";
import type {
  LeadType,
  NotificationChannel,
  RedditTargetType,
} from "@prisma/client";

type NotifyIcpLeadsInput = {
  kind: "icp";
  userId: string;
  monitorTarget: string;
  monitorTargetType: RedditTargetType;
  leads: { content: string; url: string; leadType: LeadType }[];
};

type NotifyKeywordLeadsInput = {
  kind: "keyword";
  userId: string;
  monitorTarget: string;
  monitorTargetType: RedditTargetType;
  leads: { content: string; url: string; matchedKeywords: string[] }[];
};

export type NotifyNewLeadsInput = NotifyIcpLeadsInput | NotifyKeywordLeadsInput;

/**
 * Formats a monitor's target for display, e.g. "r/SaaS" for a subreddit or
 * "list: someuser/leads" for a custom feed (multireddit).
 */
function formatMonitorLabel(
  targetType: RedditTargetType,
  target: string,
): string {
  if (targetType === "CUSTOM_FEED") {
    return `list: ${target}`;
  }
  return target.startsWith("r/") ? target : `r/${target}`;
}

function buildIcpBreakdown(leads: NotifyIcpLeadsInput["leads"]): string {
  const counts: Record<LeadType, number> = { WARM: 0, COLD: 0, NEUTRAL: 0 };
  for (const lead of leads) {
    counts[lead.leadType]++;
  }

  return (["WARM", "COLD", "NEUTRAL"] as LeadType[])
    .filter((type) => counts[type] > 0)
    .map((type) => `${counts[type]} ${type}`)
    .join(" · ");
}

/**
 * Filters and dispatches qualifying leads to a single notification channel,
 * per that channel's preferences (lead types / keyword matches toggle).
 */
async function dispatchToChannel(
  channel: NotificationChannel,
  input: NotifyNewLeadsInput,
): Promise<void> {
  const dashboardUrl = `${env.FRONTEND_URL}/dashboard/leads`;
  const monitorLabel = formatMonitorLabel(
    input.monitorTargetType,
    input.monitorTarget,
  );

  let qualifyingLeads: { content: string; url: string }[];
  let breakdown: string;

  if (input.kind === "icp") {
    const filtered = input.leads.filter((lead) =>
      channel.notifyLeadTypes.includes(lead.leadType),
    );
    if (filtered.length === 0) return;

    qualifyingLeads = filtered;
    breakdown = buildIcpBreakdown(filtered);
  } else {
    if (!channel.notifyKeywordMatches) return;
    if (input.leads.length === 0) return;

    qualifyingLeads = input.leads;
    breakdown = `${input.leads.length} keyword match${input.leads.length === 1 ? "" : "es"}`;
  }

  switch (channel.type) {
    case "DISCORD":
      await sendDiscordLeadNotification(channel.destination, {
        monitorLabel,
        breakdown,
        totalCount: qualifyingLeads.length,
        leads: qualifyingLeads,
        dashboardUrl,
      });
      break;
    default:
      logger.warn(
        `[Notifications] No sender configured for channel type: ${channel.type}`,
      );
  }
}

/**
 * Notifies a user's enabled notification channels about newly created leads
 * from a single completed scrape job. Best-effort: never throws, so a
 * webhook failure can never fail or roll back the scrape job that called it.
 */
export async function notifyNewLeads(
  input: NotifyNewLeadsInput,
): Promise<void> {
  try {
    if (input.leads.length === 0) return;

    const user = await db.user.findUnique({
      where: { id: input.userId },
      include: {
        subscription: true,
        notificationChannels: { where: { enabled: true } },
      },
    });

    if (!user?.subscription) return;
    if (!TIER_LIMITS[user.subscription.tier].notifications) return;
    if (user.notificationChannels.length === 0) return;

    for (const channel of user.notificationChannels) {
      await dispatchToChannel(channel, input);
    }
  } catch (error) {
    logger.error("[Notifications] Failed to notify new leads:", error);
  }
}

/**
 * Sends a test message to a Discord webhook, used by the "send test message"
 * button in notification settings. Best-effort, never throws.
 */
export async function sendTestNotification(
  webhookUrl: string,
): Promise<boolean> {
  try {
    return await sendDiscordTestMessage(webhookUrl);
  } catch (error) {
    logger.error("[Notifications] Failed to send test notification:", error);
    return false;
  }
}
