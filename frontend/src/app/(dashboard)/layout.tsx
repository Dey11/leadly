import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/shell";
import { type DashboardNavItem } from "@/components/dashboard/nav";
import { getAccountSummary, getScheduleLimits } from "@/lib/backend-queries";
import type { AccountSummary } from "@/types/backend";
import { Walkthrough } from "@/components/dashboard/walkthrough";

const leadGenNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "overview" },
  { href: "/dashboard/leads", label: "Leads", icon: "leads" },
  { href: "/dashboard/icps", label: "ICPs", icon: "icps" },
  { href: "/dashboard/monitors", label: "Monitors", icon: "monitors" },
  { href: "/dashboard/schedule", label: "Schedule", icon: "schedule" },
  { href: "/dashboard/billing", label: "Billing", icon: "billing" },
  { href: "/dashboard/account", label: "Account", icon: "account" },
];

const keywordNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "overview" },
  { href: "/dashboard/keyword-leads", label: "Matches", icon: "keywordLeads" },
  {
    href: "/dashboard/keyword-sets",
    label: "Keywords",
    icon: "keywordSets",
  },
  {
    href: "/dashboard/keyword-monitors",
    label: "Monitors",
    icon: "keywordMonitors",
  },
  { href: "/dashboard/schedule", label: "Schedule", icon: "schedule" },
  { href: "/dashboard/billing", label: "Billing", icon: "billing" },
  { href: "/dashboard/account", label: "Account", icon: "account" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const designMode = process.env.NEXT_PUBLIC_DESIGN_MODE === "1";

  let account: AccountSummary | null = null;

  try {
    account = await getAccountSummary();
  } catch (error) {
    if (!designMode) {
      throw error;
    }
  }

  if (!account) {
    if (designMode) {
      account = {
        id: "design-account",
        name: "Dr. Amelia Rhodes",
        email: "amelia.rhodes@leadly.app",
        emailVerified: true,
        image: null,
        createdAt: new Date().toISOString(),
        hasSeenWalkthrough: false,
      };
    } else {
      redirect("/login");
    }
  }

  if (!account) {
    redirect("/login");
  }

  let tierLabel = "Free";
  let limitsDescription =
    "3 monitors · 1 scrape/day · Upgrade to unlock real-time alerts.";

  if (designMode) {
    tierLabel = "Plus";
    limitsDescription =
      "8 monitors · 6 scrapes/day · 18 scheduled hours (design sample).";
  } else {
    try {
      const limits = await getScheduleLimits();
      if (limits) {
        tierLabel = limits.tier
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase());
        limitsDescription = `${limits.limits.monitors} monitors · ${limits.limits.scrapesPerDay} scrapes/day · ${limits.limits.selectableHours} scheduled hours.`;
      }
    } catch {
      // Ignore errors (e.g., subscription missing); default values are fine.
    }
  }

  return (
    <div className="bg-background selection:bg-primary/20 relative min-h-screen">
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="from-primary/5 via-background to-background absolute top-0 left-1/2 h-[600px] w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] blur-[120px]" />
      </div>
      <Walkthrough hasSeenWalkthrough={account.hasSeenWalkthrough} />
      <DashboardShell
        leadGenNavItems={leadGenNavItems}
        keywordNavItems={keywordNavItems}
        tierLabel={tierLabel}
        limitsDescription={limitsDescription}
        accountName={account.name ?? "Leadly user"}
        accountEmail={account.email}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
