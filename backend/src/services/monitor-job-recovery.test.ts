import { describe, expect, test } from "bun:test";
import { selectLatestFailedJobsWithoutActiveMonitor } from "./monitor-job-retry-selection";

describe("failed monitor job retry selection", () => {
  test("retries only the latest failed job for monitors without active work", () => {
    const jobs = selectLatestFailedJobsWithoutActiveMonitor(
      [
        {
          id: "old-a",
          monitorId: "monitor-a",
          monitorTarget: "r/a",
          createdAt: new Date("2026-08-04T05:00:00.000Z"),
          retryCount: 1,
          errorMessage: "old failure",
        },
        {
          id: "new-a",
          monitorId: "monitor-a",
          monitorTarget: "r/a",
          createdAt: new Date("2026-08-04T06:00:00.000Z"),
          retryCount: 2,
          errorMessage: "new failure",
        },
        {
          id: "active-b",
          monitorId: "monitor-b",
          monitorTarget: "r/b",
          createdAt: new Date("2026-08-04T06:00:00.000Z"),
          retryCount: 1,
          errorMessage: "failure",
        },
      ],
      new Set(["monitor-b"]),
    );

    expect(jobs.map((job) => job.id)).toEqual(["new-a"]);
  });
});
