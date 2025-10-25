import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacy Policy · ${siteConfig.name}`,
  description:
    "Learn how Leadly collects, stores, and uses data to deliver community-sourced leads responsibly.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-16 md:px-8">
      <header>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective date: March 2025 — Leadly (“we”, “our”, or “us”) is
          committed to protecting your privacy and ensuring responsible data
  handling.
        </p>
      </header>
      <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Leadly monitors public community data that your team selects (for
          example, Reddit threads) to highlight potential buying intent. We do
          not retain personal data that is not essential to delivering the
          service, and we never sell your contact information. When you create
          an account we store your name, email address, hashed password, and
          session information in order to keep your workspace secure.
        </p>
        <p>
          Platform credentials such as API keys or OAuth tokens are encrypted at
          rest and scoped to the minimum permissions required. Only authorized
          team members with a legitimate business reason can access customer
          data. Logs and aggregated telemetry are retained for up to 30 days to
          help us troubleshoot issues and ensure platform reliability.
        </p>
        <p>
          If you would like to request the deletion of your account data you can
          use the “Delete account” option inside the app or email us at{" "}
          <a
            href="mailto:privacy@leadly.live"
            className="font-medium text-primary hover:text-primary/80"
          >
            privacy@leadly.live
          </a>
          . We respond to all requests within 72 hours.
        </p>
      </section>
    </div>
  );
}

