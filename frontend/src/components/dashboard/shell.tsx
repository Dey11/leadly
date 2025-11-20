"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, LogOut, Menu, PanelsTopLeft, Sparkles, X } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DashboardNav, type DashboardNavItem } from "./nav";

type DashboardShellProps = {
  navItems: DashboardNavItem[];
  tierLabel: string;
  limitsDescription: string;
  accountName?: string | null;
  accountEmail?: string | null;
  children: React.ReactNode;
};

export function DashboardShell({
  navItems,
  tierLabel,
  limitsDescription,
  accountName,
  accountEmail,
  children,
}: DashboardShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const resolvedName = accountName?.trim() || "Leadly workspace";
  const resolvedEmail = accountEmail || "member@leadly.app";
  const avatarInitial = resolvedName.charAt(0).toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <Link
        href="/dashboard"
        className="group flex items-center gap-3 px-6 pt-8 text-sidebar-foreground transition-colors hover:text-primary"
      >
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary shadow-sm">
          <PanelsTopLeft className="size-5" aria-hidden />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">Leadly</span>
          <span className="text-xs text-muted-foreground">
            Growth intelligence
          </span>
        </div>
      </Link>

      <div className="px-4 pb-6 pt-8">
        <DashboardNav
          items={navItems}
          orientation="vertical"
          variant="sidebar"
          onNavigate={() => setIsMobileNavOpen(false)}
        />
      </div>

      <div className="mt-auto space-y-4 px-5 pb-8">
        <section className="rounded-2xl border border-sidebar-border bg-sidebar/80 p-4 text-sm shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Current plan
              </p>
              <p className="text-sm font-semibold text-sidebar-foreground">
                {tierLabel} tier
              </p>
            </div>
            <Badge className="bg-primary/15 text-primary">Beta</Badge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {limitsDescription}
          </p>
        </section>

        <section className="rounded-2xl border border-sidebar-border bg-sidebar/70 p-4 text-xs leading-relaxed text-muted-foreground shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground">
            <Sparkles className="size-4 text-primary" aria-hidden />
            Workspace tips
          </div>
          <p className="mt-2">
            Rotate monitors weekly to keep capture quality high, and adjust your
            scrape schedule to mirror audience activity.
          </p>
          <Link
            href="/dashboard/monitors"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary/80"
          >
            Optimize monitors
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </section>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-sidebar-border bg-sidebar/90 shadow-[inset_-1px_0px_rgba(119,51,68,0.05)] backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
        {sidebarContent}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 px-4 py-4 backdrop-blur md:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-border/70 bg-card/70 text-foreground shadow-sm hover:bg-primary/10 hover:text-primary lg:hidden"
                onClick={() => setIsMobileNavOpen((state) => !state)}
                aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
              >
                {isMobileNavOpen ? (
                  <X className="size-5" aria-hidden />
                ) : (
                  <Menu className="size-5" aria-hidden />
                )}
              </Button>
              <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge
                variant="outline"
                className="hidden border-primary/30 text-primary sm:inline-flex"
              >
                {tierLabel} tier
              </Badge>
              <div className="hidden size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary shadow-sm sm:flex sm:size-11">
                {avatarInitial}
              </div>
              <div className="flex items-center gap-2">
                <LogoutButton
                  variant="outline"
                  size="icon-sm"
                  className="sm:hidden"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" aria-hidden />
                  <span className="sr-only">Sign out</span>
                </LogoutButton>
                <LogoutButton variant="outline" size="sm" className="hidden sm:inline-flex">
                  Sign out
                </LogoutButton>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
            {children}
          </div>
        </main>
      </div>

      {isHydrated ? (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity lg:hidden",
            isMobileNavOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
          aria-hidden={!isMobileNavOpen}
          onClick={() => setIsMobileNavOpen(false)}
        />
      ) : null}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border bg-sidebar/95 shadow-xl transition-transform duration-300 lg:hidden",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 pt-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sidebar-foreground"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-base font-semibold text-primary shadow-sm">
                <PanelsTopLeft className="size-5" aria-hidden />
              </span>
              <span className="text-sm font-semibold">Leadly</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-foreground hover:bg-primary/10 hover:text-primary"
              onClick={() => setIsMobileNavOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-5" aria-hidden />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <DashboardNav
              items={navItems}
              orientation="vertical"
              variant="sidebar"
              onNavigate={() => setIsMobileNavOpen(false)}
            />
          </div>

          <div className="space-y-4 px-5 pb-6 text-sm">
            <div className="rounded-2xl border border-sidebar-border bg-sidebar/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Signed in
              </p>
              <p className="mt-1 text-sm font-semibold text-sidebar-foreground">
                {resolvedName}
              </p>
              <p className="text-xs text-muted-foreground">{resolvedEmail}</p>
            </div>
            <LogoutButton className="w-full" variant="outline">
              Sign out
            </LogoutButton>
          </div>
        </div>
      </div>
    </div>
  );
}
