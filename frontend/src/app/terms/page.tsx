import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SEO_CONFIG } from "@/constants/seo";
import { SUPPORT_EMAIL } from "@/constants/config";

export const metadata: Metadata = {
  title: SEO_CONFIG.legal.terms.title,
  description: SEO_CONFIG.legal.terms.description,
};

export default function TermsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-5 py-16 md:px-8">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground flex items-center text-sm transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      <header>
        <h1 className="text-foreground text-3xl font-bold md:text-4xl">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Effective date: January 3, 2026 — Last updated: January 3, 2026
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Leadly. These Terms of Service ("Terms") govern your
            access to and use of the Leadly website, services, and applications
            (collectively, the "Service"). By creating an account or using the
            Service, you agree to be bound by these Terms.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            1. Account Terms
          </h2>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>You must be at least 16 years old to use this Service</li>
            <li>
              You must provide accurate, complete registration information
            </li>
            <li>
              You are responsible for maintaining the security of your account
              credentials
            </li>
            <li>
              You are responsible for all activities that occur under your
              account
            </li>
            <li>
              You must notify us immediately of any unauthorized use of your
              account
            </li>
            <li>
              One person or organization may not maintain multiple free accounts
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            2. Acceptable Use Policy
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree NOT to:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>Violate any laws or regulations applicable to you</li>
            <li>
              Violate the terms of service of Reddit or any other platform we
              integrate with
            </li>
            <li>
              Use the Service for spam, harassment, or any abusive purpose
            </li>
            <li>
              Attempt to probe, scan, or test the vulnerability of our systems
            </li>
            <li>
              Attempt to reverse engineer, decompile, or extract source code
            </li>
            <li>
              Interfere with or disrupt the integrity or performance of the
              Service
            </li>
            <li>
              Access the Service through automated means (bots, scrapers) except
              our official APIs
            </li>
            <li>
              Use leads obtained through Leadly to harass or spam individuals
            </li>
            <li>Share your account credentials with others</li>
            <li>
              Resell or redistribute access to the Service without authorization
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            3. Reddit and Platform Compliance
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            You acknowledge and agree that:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              Leadly monitors publicly available content from Reddit. You must
              comply with Reddit's Terms of Service when engaging with leads
            </li>
            <li>
              You will not use information obtained through Leadly to stalk,
              harass, or otherwise harm any individual
            </li>
            <li>
              You understand that Reddit content creators retain their rights to
              their content
            </li>
            <li>
              We are not affiliated with Reddit Inc. and act as an independent
              service
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            4. Subscription and Billing
          </h2>

          <h3 className="text-foreground text-lg font-medium">Pricing</h3>
          <p className="text-muted-foreground leading-relaxed">
            Leadly offers Free, Pro ($9/month), and Premium ($24/month) plans.
            Prices are subject to change with 30 days notice to existing
            subscribers.
          </p>

          <h3 className="text-foreground mt-4 text-lg font-medium">Billing</h3>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>Paid plans are billed monthly in advance</li>
            <li>All payments are processed securely through DodoPayments</li>
            <li>
              You authorize us to charge your payment method on a recurring
              basis
            </li>
            <li>
              Failed payments may result in service suspension until resolved
            </li>
          </ul>

          <h3 className="text-foreground mt-4 text-lg font-medium">
            Cancellation and Refunds
          </h3>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              You may cancel your subscription at any time from your account
              settings
            </li>
            <li>
              Cancellation takes effect at the end of the current billing period
            </li>
            <li>
              We offer a full refund within the first 7 days of your
              subscription if you are unsatisfied. To request a refund, please
              email us with the reason for your dissatisfaction
            </li>
            <li>
              If you believe you were charged in error, contact us within 72
              hours
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            5. Data Ownership
          </h2>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              <strong>Your Data:</strong> You retain ownership of all data you
              input into Leadly (monitors, configurations, ICP definitions)
            </li>
            <li>
              <strong>Lead Data:</strong> Leads identified by Leadly are derived
              from public Reddit content. You may export and use this data in
              accordance with these Terms
            </li>
            <li>
              <strong>Aggregated Data:</strong> We may use anonymized,
              aggregated data to improve our services without identifying you
            </li>
            <li>
              <strong>Backup:</strong> We maintain backups for disaster recovery
              only and delete data in accordance with our Privacy Policy
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            6. Intellectual Property
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service, including its original content, features, and
            functionality, is owned by Leadly and is protected by international
            copyright, trademark, and other laws. Our trademarks may not be used
            without prior written consent.
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            You are granted a limited, non-exclusive, non-transferable license
            to use the Service for your internal business purposes during your
            subscription period.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            7. Disclaimer of Warranties
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY
            OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT.
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            We do not warrant that:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              The Service will be uninterrupted, timely, secure, or error-free
            </li>
            <li>
              The results obtained from the Service will be accurate or reliable
            </li>
            <li>Any leads will result in sales or business opportunities</li>
            <li>Defects in the Service will be corrected</li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            8. Limitation of Liability
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEADLY SHALL NOT BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
            DIRECTLY OR INDIRECTLY.
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Our total liability for any claims arising from or relating to these
            Terms or the Service is limited to the greater of: (a) the amount
            you paid us in the 12 months preceding the claim, or (b) $100 USD.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            9. Indemnification
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree to indemnify, defend, and hold harmless Leadly and its
            officers, directors, employees, agents, and affiliates from any
            claims, damages, losses, liabilities, costs, and expenses (including
            legal fees) arising from:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>
              Your outreach or communication with leads obtained through the
              Service
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            10. Termination
          </h2>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              <strong>By You:</strong> You may terminate your account at any
              time using the account settings or by contacting support
            </li>
            <li>
              <strong>By Us:</strong> We may suspend or terminate your access
              immediately, without prior notice, if you violate these Terms or
              pose a security risk
            </li>
            <li>
              <strong>Effect:</strong> Upon termination, your right to use the
              Service ceases immediately. We may retain your data for 30 days
              before permanent deletion
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            11. Dispute Resolution
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Any dispute arising from these Terms shall be governed by and
            construed in accordance with the laws of Bengaluru, Karnataka,
            India, without regard to conflict of law principles.
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Before filing any legal claim, you agree to attempt to resolve the
            dispute informally by contacting us at{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary hover:text-primary/80 font-medium"
            >
              {SUPPORT_EMAIL}
            </a>
            . We will attempt to resolve the dispute within 60 days.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            12. Changes to Terms
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms at any time. For material
            changes, we will provide at least 30 days notice via email or in-app
            notification. Continued use of the Service after changes take effect
            constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            13. General Provisions
          </h2>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              <strong>Entire Agreement:</strong> These Terms constitute the
              entire agreement between you and Leadly regarding the Service
            </li>
            <li>
              <strong>Severability:</strong> If any provision is found
              unenforceable, the remaining provisions remain in effect
            </li>
            <li>
              <strong>No Waiver:</strong> Failure to enforce any right or
              provision does not constitute a waiver of such right or provision
            </li>
            <li>
              <strong>Assignment:</strong> You may not assign these Terms
              without our consent; we may assign them freely
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">14. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions about these Terms should be sent to:
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

        <section className="border-border mt-8 border-t pt-8">
          <p className="text-muted-foreground text-sm">
            By using Leadly, you acknowledge that you have read, understood, and
            agree to be bound by these Terms of Service. See also our{" "}
            <Link
              href="/privacy"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/cookies"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Cookie Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
