import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Terms of Service · ${siteConfig.name}`,
  description:
    "Review the terms and conditions for accessing and using the Leadly platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-16 md:px-8">
      <header>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome to Leadly. These terms govern your access to and use of the
          platform. By creating an account you agree to the following
          commitments.
        </p>
      </header>
      <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          1. <strong>Acceptable use.</strong> You will only connect communities
          that you have permission to monitor and will comply with the terms of
          the underlying platforms (e.g., Reddit). Abusive scraping, spam
          outreach, or attempts to reverse engineer our systems are prohibited.
        </p>
        <p>
          2. <strong>Subscription and billing.</strong> Leadly currently offers
          a Free tier. Paid plans will be announced soon and will be governed by
          a separate subscription agreement. We reserve the right to update
          pricing with reasonable notice.
        </p>
        <p>
          3. <strong>Data ownership.</strong> You retain ownership of the data
          you import into Leadly. We may use aggregated, anonymized data to
          improve the service. Backup copies are retained for disaster recovery
          purposes only.
        </p>
        <p>
          4. <strong>Termination.</strong> You can deactivate your account at
          any time. We may suspend or terminate accounts that violate these
          terms or pose security risks. Upon termination we will delete your
          data in accordance with our Privacy Policy.
        </p>
        <p>
          5. <strong>Limitation of liability.</strong> Leadly is provided “as
          is.” To the fullest extent permitted by law our liability is limited
          to the fees you have paid to us in the past 12 months (currently $0
          for Free tier).
        </p>
      </section>
    </div>
  );
}
