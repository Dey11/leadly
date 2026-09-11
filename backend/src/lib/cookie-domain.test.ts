import { describe, expect, test } from "bun:test";
import { resolveCookieDomain } from "./cookie-domain";

describe("resolveCookieDomain", () => {
  test("scopes production cookies to the configured frontend host", () => {
    expect(
      resolveCookieDomain("https://leadly.tryhanabi.com", "production"),
    ).toBe(".leadly.tryhanabi.com");
  });

  test("normalizes an explicit production override", () => {
    expect(
      resolveCookieDomain(
        "https://leadly.tryhanabi.com",
        "production",
        "tryhanabi.com",
      ),
    ).toBe(".tryhanabi.com");
  });

  test("does not set a cookie domain in development", () => {
    expect(
      resolveCookieDomain("http://localhost:3000", "development"),
    ).toBeUndefined();
  });
});
