import { describe, expect, test } from "bun:test";
import { monitorIdParamSchema } from "./monitor";

describe("monitorIdParamSchema", () => {
  test("accepts migrated monitor ids stored in production", () => {
    const result = monitorIdParamSchema.safeParse({
      id: "merged_monitors_b428e70f11f0eed7cf12f54e",
    });

    expect(result.success).toBe(true);
  });

  test("rejects empty monitor ids", () => {
    const result = monitorIdParamSchema.safeParse({ id: "" });

    expect(result.success).toBe(false);
  });
});
