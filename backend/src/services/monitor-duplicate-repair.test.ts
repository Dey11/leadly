import { describe, expect, test } from "bun:test";
import { buildMonitorDuplicateRepairPlan } from "./monitor-duplicate-repair";

const createdAt = new Date("2026-01-31T06:30:52.649Z");
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
const monitorFields = {
  platform: "REDDIT",
  targetType: "SUBREDDIT",
  cursor: null,
  status: "ACTIVE" as const,
  lastScrapedAt: null,
  createdAt,
};

describe("monitor duplicate repair plan", () => {
  test("merges copied targets, moves unique targets, and removes the migrated ICP", () => {
    const plan = buildMonitorDuplicateRepairPlan(
      "account-id",
      [
        { ...baseIcp, id: "canonical-icp" },
        { ...baseIcp, id: "merged_icps_copy" },
      ],
      [
        {
          ...monitorFields,
          id: "canonical-monitor",
          icpId: "canonical-icp",
          target: "r/forhire",
        },
        {
          ...monitorFields,
          id: "merged-monitor-copy",
          icpId: "merged_icps_copy",
          target: "r/ForHire",
        },
        {
          ...monitorFields,
          id: "merged-monitor-unique",
          icpId: "merged_icps_copy",
          target: "r/aijobs",
        },
      ],
    );

    expect(plan).toMatchObject({
      duplicateIcpCount: 1,
      duplicateMonitorCount: 1,
      movedMonitorCount: 1,
      groups: [
        {
          canonicalIcpId: "canonical-icp",
          redundantIcpIds: ["merged_icps_copy"],
          monitorMerges: [
            {
              keeperMonitorId: "canonical-monitor",
              redundantMonitorId: "merged-monitor-copy",
            },
          ],
          monitorMoves: [
            {
              monitorId: "merged-monitor-unique",
              toIcpId: "canonical-icp",
            },
          ],
        },
      ],
    });
  });
});
