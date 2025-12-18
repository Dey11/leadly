import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/shell";
import { type DashboardNavItem } from "@/components/dashboard/nav";
import { getAccountSummary, getScheduleLimits } from "@/lib/backend-queries";
import type { AccountSummary } from "@/types/backend";

const navItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "overview" },
  { href: "/dashboard/leads", label: "Leads", icon: "leads" },
  { href: "/dashboard/icps", label: "ICPs", icon: "icps" },
  { href: "/dashboard/monitors", label: "Monitors", icon: "monitors" },
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
    <div className="relative min-h-screen bg-background selection:bg-primary/20">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background blur-[120px]" />
      </div>
      <DashboardShell
        navItems={navItems}
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
