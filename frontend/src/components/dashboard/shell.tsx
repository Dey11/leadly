"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  LogOut,
  Menu,
  PanelsTopLeft,
  Sparkles,
  X,
  Settings,
  User,
  CreditCard,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resolvedName = accountName?.trim() || "Leadly workspace";
  const resolvedEmail = accountEmail || "member@leadly.app";
  const avatarInitial = resolvedName.charAt(0).toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <Link
        href="/dashboard"
        className="group text-sidebar-foreground hover:text-primary flex items-center gap-3 px-6 pt-8 transition-colors"
      >
        <div className="relative size-11 overflow-hidden">
          <img
            src="/assets/logo-mark.png"
            alt="Leadly Logo"
            className="size-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm leading-tight font-semibold">Leadly</span>
          <span className="text-muted-foreground text-xs">
            Growth intelligence
          </span>
        </div>
      </Link>

      <div className="px-4 pt-8 pb-6">
        <DashboardNav
          items={navItems}
          orientation="vertical"
          variant="sidebar"
          onNavigate={() => setIsMobileNavOpen(false)}
        />
      </div>

      <div className="mt-auto space-y-4 px-5 pb-8">
        <section className="border-sidebar-border bg-sidebar/80 rounded-2xl border p-4 text-sm shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Current plan
              </p>
              <p className="text-sidebar-foreground text-sm font-semibold">
                {tierLabel} tier
              </p>
            </div>
            <Badge className="bg-primary/15 text-primary">Beta</Badge>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            {limitsDescription}
          </p>
        </section>

        <section className="border-sidebar-border bg-sidebar/70 text-muted-foreground rounded-2xl border p-4 text-xs leading-relaxed shadow-sm backdrop-blur">
          <div className="text-sidebar-foreground flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="text-primary size-4" aria-hidden />
            Workspace tips
          </div>
          <p className="mt-2">
            Rotate monitors weekly to keep capture quality high, and adjust your
            scrape schedule to mirror audience activity.
          </p>
          <Link
            href="/dashboard/monitors"
            className="text-primary hover:text-primary/80 mt-3 inline-flex items-center gap-1 text-xs font-semibold transition"
          >
            Optimize monitors
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </section>
        <LogoutButton
          variant="outline"
          size="lg"
          className="hidden w-full sm:inline-flex"
        >
          Sign out
        </LogoutButton>
      </div>
    </div>
  );

  return (
    <div className="from-background via-background to-secondary/20 relative min-h-screen bg-gradient-to-b lg:flex">
      <aside
        id="dashboard-sidebar"
        className="border-sidebar-border bg-sidebar/90 hidden w-72 shrink-0 border-r shadow-[inset_-1px_0px_rgba(119,51,68,0.05)] backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden"
      >
        {sidebarContent}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header
          id="dashboard-header"
          className="border-border/60 bg-background/90 sticky top-0 z-30 border-b px-4 py-4 backdrop-blur md:px-6 lg:px-10"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="border-border/70 bg-card/70 text-foreground hover:bg-primary/10 hover:text-primary rounded-full border shadow-sm lg:hidden"
                onClick={() => setIsMobileNavOpen((state) => !state)}
                aria-label={
                  isMobileNavOpen ? "Close navigation" : "Open navigation"
                }
              >
                {isMobileNavOpen ? (
                  <X className="size-5" aria-hidden />
                ) : (
                  <Menu className="size-5" aria-hidden />
                )}
              </Button>
              {/* <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                Dashboard
              </h1> */}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <ModeToggle />
              </div>
              <Badge
                variant="outline"
                className="border-primary/30 text-primary hidden sm:inline-flex"
              >
                {tierLabel} tier
              </Badge>
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="bg-primary/15 text-primary hover:bg-primary/25 flex size-10 cursor-pointer items-center justify-center rounded-full text-sm font-semibold shadow-sm transition-all hover:scale-105 sm:size-11"
                  aria-label="Open profile menu"
                  aria-expanded={isProfileOpen}
                >
                  {avatarInitial}
                </button>
                {isProfileOpen && (
                  <div className="border-border bg-card animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border py-2 shadow-lg duration-200">
                    <div className="border-border border-b px-4 py-3">
                      <p className="text-foreground truncate text-sm font-semibold">
                        {resolvedName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {resolvedEmail}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard/account"
                        className="text-foreground hover:bg-primary/10 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="text-muted-foreground size-4" />
                        Account settings
                      </Link>
                      <Link
                        href="/dashboard/billing"
                        className="text-foreground hover:bg-primary/10 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <CreditCard className="text-muted-foreground size-4" />
                        Billing & plans
                      </Link>
                    </div>
                    <div className="border-border border-t pt-1">
                      <LogoutButton
                        variant="ghost"
                        className="text-foreground hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-3 rounded-none px-4 py-2.5 text-sm"
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </LogoutButton>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 sm:hidden">
                <LogoutButton
                  variant="outline"
                  size="icon-sm"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" aria-hidden />
                  <span className="sr-only">Sign out</span>
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
          "border-sidebar-border bg-sidebar/95 fixed inset-y-0 left-0 z-50 w-72 border-r shadow-xl transition-transform duration-300 lg:hidden",
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
              className="text-sidebar-foreground flex items-center gap-2"
            >
              <div className="relative size-10 overflow-hidden">
                <img
                  src="/assets/logo-mark.png"
                  alt="Leadly Logo"
                  className="size-full object-contain"
                />
              </div>
              <span className="text-sm font-semibold">Leadly</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-primary/10 hover:text-primary rounded-full"
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
            <div className="border-sidebar-border bg-sidebar/80 rounded-2xl border p-4 shadow-sm">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Signed in
              </p>
              <p className="text-sidebar-foreground mt-1 text-sm font-semibold">
                {resolvedName}
              </p>
              <p className="text-muted-foreground text-xs">{resolvedEmail}</p>
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
