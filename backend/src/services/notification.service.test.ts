import { expect, test } from "bun:test";

// A separate process keeps notification mocks out of other backend suites.
test("Discord sends only eligible warm/neutral leads, preserving keyword and tier gates", async () => {
  const script = String.raw`
    import { expect, mock } from "bun:test";
    const root = process.cwd() + "/src/";
    const sent = [];
    const channel = { type: "DISCORD", destination: "unused", notifyLeadTypes: ["WARM", "COLD", "NEUTRAL"], notifyKeywordMatches: true };
    const user = { subscription: { tier: "PRO", status: "ACTIVE", currentPeriodEnd: new Date(Date.now() + 86400000) }, notificationChannels: [channel] };
    mock.module(root + "lib/db.ts", () => ({ default: { user: { findUnique: async () => user } } }));
    mock.module(root + "env.ts", () => ({ env: { FRONTEND_URL: "https://example.invalid" } }));
    mock.module(root + "lib/logger.ts", () => ({ default: { error(error) { throw error; }, warn() {} } }));
    mock.module(root + "lib/discord.ts", () => ({ sendDiscordLeadNotification: async (_, payload) => { sent.push(payload); }, sendDiscordTestMessage: async () => true }));
    const { notifyNewLeads } = await import(root + "services/notification.service.ts");
    const base = { kind: "icp", userId: "test", monitorTarget: "smallbusiness", monitorTargetType: "SUBREDDIT" };
    const leads = ["WARM", "COLD", "NEUTRAL"].map(leadType => ({ leadType, content: leadType, url: "https://example.invalid/" + leadType }));
    await notifyNewLeads({ ...base, leads });
    expect(sent[0].totalCount).toBe(2);
    expect(sent[0].leads.map(l => l.content)).toEqual(["WARM", "NEUTRAL"]);
    expect(sent[0].breakdown).toBe("1 WARM · 1 NEUTRAL");
    await notifyNewLeads({ ...base, leads: [leads[1]] });
    expect(sent).toHaveLength(1);
    channel.notifyLeadTypes = ["NEUTRAL", "COLD"];
    await notifyNewLeads({ ...base, leads });
    expect(sent[1].leads.map(l => l.content)).toEqual(["NEUTRAL"]);
    await notifyNewLeads({ ...base, kind: "keyword", leads: [{ content: "keyword", url: "https://example.invalid", matchedKeywords: ["test"] }] });
    expect(sent[2].breakdown).toBe("1 keyword match");
    channel.notifyKeywordMatches = false;
    await notifyNewLeads({ ...base, kind: "keyword", leads: [{ content: "keyword", url: "https://example.invalid", matchedKeywords: ["test"] }] });
    expect(sent).toHaveLength(3);
    user.subscription.tier = "FREE";
    await notifyNewLeads({ ...base, leads });
    expect(sent).toHaveLength(3);
    const { upsertNotificationChannelSchema } = await import(root + "types/notification.ts");
    const input = { destination: "https://discord.com/api/webhooks/123/test-token" };
    expect(upsertNotificationChannelSchema.parse(input).notifyLeadTypes).toEqual(["WARM", "NEUTRAL"]);
    expect(upsertNotificationChannelSchema.safeParse({ ...input, notifyLeadTypes: ["COLD"] }).success).toBe(false);
  `;
  const child = Bun.spawn([process.execPath, "--eval", script], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const error = await new Response(child.stderr).text();
  expect(await child.exited, error).toBe(0);
});
