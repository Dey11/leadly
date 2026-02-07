import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SEO_CONFIG } from "@/constants/seo";
import { SUPPORT_EMAIL } from "@/constants/config";

export const metadata: Metadata = {
  title: SEO_CONFIG.legal.cookies.title,
  description: SEO_CONFIG.legal.cookies.description,
};

export default function CookiesPage() {
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
          Cookie Policy
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Last updated: January 3, 2026
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            This Cookie Policy explains what cookies are, how Leadly uses them,
            your choices regarding cookies, and where to find more information.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            What Are Cookies?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Cookies are small text files that are stored on your device
            (computer, tablet, or mobile) when you visit a website. They are
            widely used to make websites work more efficiently, provide
            information to site owners, and improve user experience.
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Cookies can be "session" cookies (deleted when you close your
            browser) or "persistent" cookies (remain on your device for a set
            period or until you delete them).
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            Cookies We Use
          </h2>

          <h3 className="text-foreground mt-6 text-lg font-medium">
            Necessary Cookies (Always Active)
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            These cookies are essential for the website to function properly.
            They enable core functionality like security, authentication, and
            session management. You cannot opt out of these cookies.
          </p>
          <div className="bg-muted/30 mt-4 rounded-lg p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-foreground py-2 text-left font-medium">
                    Cookie Name
                  </th>
                  <th className="text-foreground py-2 text-left font-medium">
                    Purpose
                  </th>
                  <th className="text-foreground py-2 text-left font-medium">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-border/50 border-b">
                  <td className="py-2 font-mono text-xs">session_token</td>
                  <td className="py-2">Maintains your authenticated session</td>
                  <td className="py-2">7 days</td>
                </tr>
                {/*
                todo: implement CSRF protection and add csrf_token cookie to this list
                */}
                {/* <tr className="border-border/50 border-b">
                  <td className="py-2 font-mono text-xs">csrf_token</td>
                  <td className="py-2">
                    Security - prevents cross-site request forgery
                  </td>
                  <td className="py-2">Session</td>
                </tr> */}
                <tr>
                  <td className="py-2 font-mono text-xs">
                    leadly_cookie_consent
                  </td>
                  <td className="py-2">Stores your cookie preferences</td>
                  <td className="py-2">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-foreground mt-8 text-lg font-medium">
            Analytics Cookies (Optional)
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            These cookies help us understand how visitors interact with our
            website by collecting and reporting information anonymously. They
            help us improve our service. You can opt out of these cookies.
          </p>
          <div className="bg-muted/30 mt-4 rounded-lg p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-foreground py-2 text-left font-medium">
                    Cookie Name
                  </th>
                  <th className="text-foreground py-2 text-left font-medium">
                    Provider
                  </th>
                  <th className="text-foreground py-2 text-left font-medium">
                    Purpose
                  </th>
                  <th className="text-foreground py-2 text-left font-medium">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-border/50 border-b">
                  <td className="py-2 font-mono text-xs">__cf_bm</td>
                  <td className="py-2">Cloudflare</td>
                  <td className="py-2">Bot management and security</td>
                  <td className="py-2">30 minutes</td>
                </tr>
                <tr className="border-border/50 border-b">
                  <td className="py-2 font-mono text-xs">_ga, _gid</td>
                  <td className="py-2">Google Analytics</td>
                  <td className="py-2">Website analytics - traffic analysis</td>
                  <td className="py-2">2 years / 24 hours</td>
                </tr>
                <tr className="border-border/50 border-b">
                  <td className="py-2 font-mono text-xs">umami.disabled</td>
                  <td className="py-2">Umami</td>
                  <td className="py-2">
                    Stores preference if you opt-out of tracking
                  </td>
                  <td className="py-2">Persistent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            Managing Your Cookie Preferences
          </h2>

          <h3 className="text-foreground mt-6 text-lg font-medium">
            On Our Website
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            When you first visit Leadly, you'll see a cookie consent banner in
            the bottom-right corner. You can choose:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              <strong>Accept All:</strong> Enables all cookies, including
              analytics
            </li>
            <li>
              <strong>Necessary Only:</strong> Only essential cookies are used;
              analytics are disabled
            </li>
          </ul>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            To change your preferences later, clear your browser's localStorage
            for leadly.live and refresh the page. The consent banner will appear
            again.
          </p>

          <h3 className="text-foreground mt-6 text-lg font-medium">
            In Your Browser
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Most web browsers allow you to control cookies through their
            settings. You can:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>View what cookies are stored on your device</li>
            <li>Delete some or all cookies</li>
            <li>Block cookies from specific websites</li>
            <li>
              Block all cookies (note: this may break some website
              functionality)
            </li>
          </ul>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            For instructions on managing cookies in your specific browser:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            Third-Party Cookies
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We use services from the following third parties that may set
            cookies on your device:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              <strong>Umami Analytics:</strong> Privacy-focused analytics. We
              use Umami in a way that respects your privacy and avoids using
              tracking cookies for personal identification.
            </li>
            <li>
              <strong>Google Analytics:</strong> Website analytics. See their{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <strong>DodoPayments:</strong> Payment processing. See their{" "}
              <a
                href="https://dodopayments.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            Do Not Track
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Some browsers include a "Do Not Track" (DNT) feature. We currently
            do not respond to DNT signals. However, you can manage your
            preferences using our cookie consent banner.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            Changes to This Policy
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Cookie Policy from time to time. Changes will be
            reflected on this page with an updated "Last updated" date.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-foreground text-xl font-semibold">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about our use of cookies, please contact us
            at:
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
            See also our{" "}
            <Link
              href="/privacy"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Terms of Service
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
