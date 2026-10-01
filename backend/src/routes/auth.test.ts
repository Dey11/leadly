import { describe, expect, test } from "bun:test";

// Isolate module mocks from the scheduler and automation test suites.
async function exerciseEmailRateLimit(
  action: "forgot" | "verify" | "register",
) {
  const { limit, path } = {
    forgot: { limit: 3, path: "forgot-password" },
    verify: { limit: 2, path: "resend-verification-email" },
    register: { limit: 5, path: "register" },
  }[action];
  const script = `
    import { mock } from "bun:test";
    import express from "express";
    let count = 0;
    let emails = 0;
    const user = {
      id: "test-user", email: "recovery@example.com", isDeleted: false,
      passwordHash: "test-hash", emailVerified: ${action !== "verify"},
    };
    mock.module("./src/env", () => ({ env: { NODE_ENV: "production" } }));
    mock.module("./src/lib/logger", () => ({ default: {
      info() {}, warn() {}, error() {},
    } }));
    mock.module("./src/lib/db", () => ({ default: { user: {
      findUnique: async () => user, update: async () => user,
    } } }));
    mock.module("./src/lib/email", () => ({
      sendPasswordResetEmail: async () => { emails += 1; },
      sendVerificationEmail: async () => { emails += 1; },
    }));
    mock.module("./src/lib/redis", () => ({ getRedis: () => ({
      incr: async () => ++count,
      get: async () => String(count),
      pexpire: async () => 1,
      pttl: async () => 60000,
    }) }));
    const { authRouter } = await import("./src/routes/auth");
    const app = express();
    app.use(express.json());
    app.use(authRouter);
    const server = app.listen(0, "127.0.0.1");
    await new Promise(resolve => server.once("listening", resolve));
    const statuses = [];
    try {
      const port = server.address().port;
      for (let request = 0; request < ${limit + 1}; request++) {
        const response = await fetch(
          "http://127.0.0.1:" + port + "/${path}",
          { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, name: "Test user", password: "Testpassword123!" }) },
        );
        statuses.push(response.status);
        await response.text();
      }
    } finally {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
    console.log(JSON.stringify({ statuses, emails, count }));
  `;
  const child = Bun.spawn([process.execPath, "--eval", script], {
    cwd: process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
  });
  const output = await new Response(child.stdout).text();
  const error = await new Response(child.stderr).text();
  expect(await child.exited, error).toBe(0);
  return JSON.parse(output.trim()) as {
    statuses: number[];
    emails: number;
    count: number;
  };
}

describe("authentication request limits", () => {
  test("lets five registration attempts reach validation before blocking", async () => {
    expect(await exerciseEmailRateLimit("register")).toEqual({
      statuses: [400, 400, 400, 400, 400, 429],
      emails: 0,
      count: 6,
    });
  });

  test("allows three recovery emails and blocks the fourth request", async () => {
    expect(await exerciseEmailRateLimit("forgot")).toEqual({
      statuses: [200, 200, 200, 429],
      emails: 3,
      count: 4,
    });
  });

  test("allows two verification emails and blocks the third request", async () => {
    expect(await exerciseEmailRateLimit("verify")).toEqual({
      statuses: [200, 200, 429],
      emails: 2,
      count: 3,
    });
  });
});
