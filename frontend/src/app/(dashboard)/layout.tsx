import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";
import type { DashboardNavItem } from "@/components/dashboard/nav";
import { LogoutButton } from "@/components/auth/logout-button";
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-12 pt-8 md:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-lg font-semibold text-foreground"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-base font-semibold text-primary">
                L
              </span>
              Leadly dashboard
            </Link>
            <p className="text-sm text-muted-foreground">
              Stay in sync with your community monitors and act on the
              conversations that matter.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">
                {account.name ?? "Leadly user"}
              </p>
              <p>{account.email}</p>
            </div>
            <LogoutButton variant="outline" size="sm">
              Sign out
            </LogoutButton>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:flex lg:flex-col lg:gap-6">
            <Card className="bg-background/80">
              <CardHeader>
                <CardTitle className="text-base">Navigation</CardTitle>
                <CardDescription>Jump to a workspace view.</CardDescription>
              </CardHeader>
              <CardContent className="gap-2">
                <DashboardNav items={navItems} />
              </CardContent>
            </Card>

            <Card className="bg-background/80">
              <CardHeader>
                <CardTitle className="text-base">Current plan</CardTitle>
                <CardDescription>
                  You are on the {tierLabel} tier.
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-2 text-sm text-muted-foreground">
                <p>{limitsDescription}</p>
                <p className="text-xs">
                  Payments go live soon. We will notify you inside the app when
                  upgrades are available.
                </p>
              </CardContent>
            </Card>
          </aside>

          <div className="flex flex-col gap-6">
            <div className="lg:hidden">
              <Card className="bg-background/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Workspace</CardTitle>
                  <CardDescription>Navigate across views.</CardDescription>
                </CardHeader>
                <CardContent className="gap-2">
                  <DashboardNav orientation="horizontal" items={navItems} />
                </CardContent>
              </Card>
            </div>
            <main className="flex flex-col gap-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
