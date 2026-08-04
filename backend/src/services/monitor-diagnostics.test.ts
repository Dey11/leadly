import { describe, expect, test } from "bun:test";
import {
  findBusinessDuplicateMonitorGroups,
  findDuplicateIcpGroups,
} from "./monitor-diagnostics";

const createdAt = new Date("2026-01-31T06:35:30.245Z");
const baseIcp = {
  name: "Startup & SMB Software/Web Dev",
  summary: "Software teams",
  targetPersona: "Founder",
  pains: "Needs developers",
  valueProposition: "Qualified leads",
  qualifyingSignals: "Hiring",
  disqualifyingSignals: "Spam",
  platform: "REDDIT",
  createdAt,
};

describe("monitor duplicate diagnostics", () => {
  test("detects monitor copies split across equivalent migrated ICPs", () => {
    const icps = [
      { ...baseIcp, id: "original-icp" },
      { ...baseIcp, id: "merged-icp" },
    ];
    const monitors = [
      {
        id: "original-monitor",
        icpId: "original-icp",
        platform: "REDDIT",
        targetType: "SUBREDDIT",
        target: "r/ForHire",
        createdAt,
      },
      {
        id: "merged-monitor",
        icpId: "merged-icp",
        platform: "REDDIT",
        targetType: "SUBREDDIT",
        target: " r/forhire ",
        createdAt,
      },
    ];

    expect(findDuplicateIcpGroups(icps)).toHaveLength(1);
    expect(findBusinessDuplicateMonitorGroups(icps, monitors)).toMatchObject([
      {
        normalizedTarget: "r/forhire",
        monitorCount: 2,
        monitorIds: ["original-monitor", "merged-monitor"],
        icpIds: ["original-icp", "merged-icp"],
      },
    ]);
  });

  test("allows the same target for genuinely different ICP definitions", () => {
    const icps = [
      { ...baseIcp, id: "agency-icp" },
      { ...baseIcp, id: "saas-icp", targetPersona: "SaaS founder" },
    ];
    const monitors = [
      {
        id: "agency-monitor",
        icpId: "agency-icp",
        platform: "REDDIT",
        targetType: "SUBREDDIT",
        target: "r/startups",
        createdAt,
      },
      {
        id: "saas-monitor",
        icpId: "saas-icp",
        platform: "REDDIT",
        targetType: "SUBREDDIT",
        target: "r/startups",
        createdAt,
      },
    ];

    expect(findDuplicateIcpGroups(icps)).toHaveLength(0);
    expect(findBusinessDuplicateMonitorGroups(icps, monitors)).toHaveLength(0);
  });
});
