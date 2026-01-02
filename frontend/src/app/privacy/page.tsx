import type { Metadata } from "next";
import Link from "next/link";
import { SEO_CONFIG } from "@/constants/seo";
import { SUPPORT_EMAIL } from "@/constants/config";

export const metadata: Metadata = {
  title: SEO_CONFIG.legal.privacy.title,
  description: SEO_CONFIG.legal.privacy.description,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-5 py-16 md:px-8">
      <header>
        <h1 className="text-foreground text-3xl font-bold md:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Effective date: January 2026 — Last updated: January 1, 2026
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Leadly ("we", "our", or "us") is committed to protecting your
            privacy and ensuring responsible data handling. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our website and services.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            1. Information We Collect
          </h2>

          <h3 className="text-foreground text-lg font-medium">
            Personal Information
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            When you create an account, we collect:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>Name and email address</li>
            <li>Hashed password (we never store plaintext passwords)</li>
            <li>Account preferences and settings</li>
            <li>Billing information when you upgrade to a paid plan</li>
          </ul>

          <h3 className="text-foreground mt-6 text-lg font-medium">
            Usage Data
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            We automatically collect certain information when you use our
            services:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              Log data (IP address, browser type, pages visited, timestamps)
            </li>
            <li>Device information (operating system, device type)</li>
            <li>Feature usage patterns and interactions</li>
            <li>Monitor configurations and lead data you generate</li>
          </ul>

          <h3 className="text-foreground mt-6 text-lg font-medium">
            Cookies and Tracking
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            We use cookies and similar technologies. See our{" "}
            <Link
              href="/cookies"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Cookie Policy
            </Link>{" "}
            for details.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            2. How We Use Your Information
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We use collected information to:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related communications</li>
            <li>Send you technical notices, updates, and security alerts</li>
            <li>Respond to your comments, questions, and support requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>
              Detect, investigate, and prevent fraudulent or unauthorized
              activities
            </li>
            <li>Personalize and improve your experience</li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            3. Data Sharing and Disclosure
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell your personal information. We may share information
            with:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              <strong>Service Providers:</strong> Third parties that help us
              operate our services (payment processors, analytics providers,
              hosting services)
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law,
              regulation, or legal process
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger,
              acquisition, or sale of assets
            </li>
            <li>
              <strong>With Your Consent:</strong> When you explicitly agree to
              such sharing
            </li>
          </ul>

          <h3 className="text-foreground mt-6 text-lg font-medium">
            Third-Party Services We Use
          </h3>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>DodoPayments - Payment processing</li>
            <li>PostHog - Product analytics (if you consent)</li>
            <li>Google Analytics - Website analytics (if you consent)</li>
            <li>Reddit API - Data source for lead monitoring</li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            4. Data Retention
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your personal data for as long as your account is active
            or as needed to provide services. Specifically:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>Account data: Retained until account deletion plus 30 days</li>
            <li>Lead data: Retained for 90 days after generation</li>
            <li>Log data: Retained for 30 days for troubleshooting</li>
            <li>
              Billing records: Retained as required by law (typically 7 years)
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            5. Your Rights
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              <strong>Access:</strong> Request a copy of your personal data
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate data
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your data
            </li>
            <li>
              <strong>Portability:</strong> Receive your data in a structured
              format
            </li>
            <li>
              <strong>Opt-out:</strong> Opt out of marketing communications
            </li>
            <li>
              <strong>Withdraw Consent:</strong> Withdraw consent for analytics
              cookies
            </li>
          </ul>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            To exercise these rights, use the account settings in the app or
            email us at{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary hover:text-primary/80 font-medium"
            >
              {SUPPORT_EMAIL}
            </a>
            . We respond within 72 hours.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            6. Data Security
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement appropriate security measures to protect your
            information:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>All data transmitted over HTTPS/TLS encryption</li>
            <li>Passwords are hashed using bcrypt with salt</li>
            <li>API credentials and tokens encrypted at rest</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>
              Access controls limiting data access to authorized personnel only
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            7. International Transfers
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Your information may be transferred to and processed in countries
            other than your own. We ensure appropriate safeguards are in place
            for such transfers, including standard contractual clauses where
            applicable.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            8. Children's Privacy
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Our services are not intended for individuals under 16 years of age.
            We do not knowingly collect personal information from children. If
            you believe we have collected information from a child, please
            contact us immediately.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            9. Changes to This Policy
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new policy on this page and
            updating the "Last updated" date. Significant changes will be
            communicated via email or in-app notification.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            10. Contact Us
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy or our data
            practices, contact us at:
          </p>
          <ul className="text-muted-foreground mt-4 list-none space-y-1">
            <li>
              Email:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary hover:text-primary/80 font-medium"
              >
                {SUPPORT_EMAIL}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
