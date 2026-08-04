import { describe, expect, test } from "bun:test";
import { normalizeMonitorTargetForStorage } from "./monitor-identity";

describe("monitor identity", () => {
  test("canonicalizes case and whitespace before duplicate checks", () => {
    expect(normalizeMonitorTargetForStorage("  r/DesignJobs  ")).toBe(
      "r/designjobs",
    );
  });
});
