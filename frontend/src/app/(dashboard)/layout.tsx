import Link from "next/link";
import { redirect } from "next/navigation";

import {
  DashboardNav,
  DashboardNavSelect,
  type DashboardNavItem,
} from "@/components/dashboard/nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAccountSummary, getScheduleLimits } from "@/lib/backend-queries";

const navItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "overview" },
  { href: "/dashboard/leads", label: "Leads", icon: "leads" },
  { href: "/dashboard/services", label: "Services", icon: "services" },
  { href: "/dashboard/monitors", label: "Monitors", icon: "monitors" },
  { href: "/dashboard/schedule", label: "Schedule", icon: "schedule" },
  { href: "/dashboard/account", label: "Account", icon: "account" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await getAccountSummary();

  if (!account) {
    redirect("/login");
  }

  let tierLabel = "Free";
  let limitsDescription =
    "3 monitors · 1 scrape/day · Upgrade options launching soon.";

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-lg font-semibold text-foreground"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-base font-semibold text-primary">
                L
              </span>
              Leadly dashboard
            </Link>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {tierLabel} tier
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {account.name ?? "Leadly user"}
              </p>
              <p>{account.email}</p>
            </div>
            <LogoutButton variant="outline" size="sm">
              Sign out
            </LogoutButton>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-8 px-5 py-8 md:px-8">
        <aside className="hidden w-[260px] shrink-0 lg:flex lg:flex-col lg:gap-6">
          <Card className="border-border/60 bg-background/85">
            <CardHeader>
              <CardTitle className="text-base">Workspace</CardTitle>
              <CardDescription>
                Navigate across Leadly views.
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-2">
              <DashboardNav items={navItems} />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/85">
            <CardHeader>
              <CardTitle className="text-base">Current plan</CardTitle>
              <CardDescription>
                Track your limits while upgrades roll out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{limitsDescription}</p>
              <p className="text-xs">
                Billing unlocks soon—existing workspaces keep launch pricing.
              </p>
            </CardContent>
          </Card>
        </aside>

        <div className="flex w-full flex-col gap-6">
          <div className="grid gap-4 lg:hidden">
            <Card className="border-border/60 bg-background/85">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Navigate</CardTitle>
                <CardDescription>Select a dashboard view.</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardNavSelect items={navItems} />
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-background/85">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Current plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{limitsDescription}</p>
                <p className="text-xs">
                  Billing unlocks soon—existing workspaces keep launch pricing.
                </p>
              </CardContent>
            </Card>
          </div>
          <main className="flex flex-col gap-8 pb-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
