import { expect, test } from "bun:test";

for (const directory of ["backend", "root", "missing"] as const) {
  test(`verification email branding from ${directory} working directory`, async () => {
    const script = String.raw`
      import { expect, mock } from "bun:test";
      import { mkdtempSync, rmdirSync } from "node:fs";
      import { tmpdir } from "node:os";
      const root = process.cwd() + "/src/";
      let payload;
      mock.module("resend", () => ({ Resend: class { emails = { send: async input => { payload = input; return {}; } }; } }));
      mock.module(root + "env.ts", () => ({ env: { RESEND_API_KEY: "unused", EMAIL_FROM: "test@example.invalid" } }));
      mock.module(root + "lib/logger.ts", () => ({ default: { warn() {}, error() {} } }));
      const original = process.cwd();
      const directory = ${JSON.stringify(directory)};
      const missing = directory === "missing" ? mkdtempSync(tmpdir() + "/leadly-email-test-") : null;
      if (directory === "root") process.chdir("..");
      if (missing) process.chdir(missing);
      try {
        const { sendVerificationEmail } = await import(root + "lib/email.ts");
        await sendVerificationEmail("test@example.invalid", "123456");
        expect(payload.html).toContain("123456");
        expect(payload.html).toContain("60 minutes");
        if (missing) {
          expect(payload.attachments).toBeUndefined();
          expect(payload.html).not.toContain("cid:");
          expect(payload.html).toContain(">Leadly</span>");
        } else {
          expect(payload.attachments).toHaveLength(1);
          const logo = payload.attachments[0];
          expect(logo.contentType).toBe("image/png");
          expect(Buffer.from(logo.content, "base64").subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
          expect(payload.html.match(/cid:leadly-logo/g)).toHaveLength(2);
          expect(logo.contentId).toBe("leadly-logo");
        }
      } finally {
        process.chdir(original);
        if (missing) rmdirSync(missing);
      }
    `;
    const child = Bun.spawn([process.execPath, "--eval", script], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const error = await new Response(child.stderr).text();
    expect(await child.exited, error).toBe(0);
  });
}
