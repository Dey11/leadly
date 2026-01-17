"use client";

import {
  CreditCard,
  HelpCircle,
  LifeBuoy,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";

import { DashboardNav, type DashboardNavItem } from "./nav";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SUPPORT_EMAIL } from "@/constants/config";
import { BugReportDialog } from "@/components/shared/bug-report-dialog";
import {
  ProductModeToggle,
  useProductMode,
} from "@/components/dashboard/product-mode-toggle";

type DashboardShellProps = {
  leadGenNavItems: DashboardNavItem[];
  keywordNavItems: DashboardNavItem[];
  tierLabel: string;
  limitsDescription: string;
  accountName?: string | null;
  accountEmail?: string | null;
  children: React.ReactNode;
};

export function DashboardShell({
  leadGenNavItems,
  keywordNavItems,
  tierLabel,
  limitsDescription,
  accountName,
  accountEmail,
  children,
}: DashboardShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const [productMode, setProductMode] = useProductMode();

  const navItems =
    productMode === "keyword" ? keywordNavItems : leadGenNavItems;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const resolvedName = accountName?.trim() || "Leadly workspace";
  const resolvedEmail = accountEmail || "member@leadly.app";

  const restartWalkthrough = () => {
    // Clear walkthrough completion flags
    window.localStorage.removeItem("leadly-walkthrough-completed");
    window.sessionStorage.removeItem("leadly-walkthrough-step");
    // Redirect with query param to force walkthrough restart
    window.location.href = "/dashboard?walkthrough=restart";
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <Link
        href="/dashboard"
        className="group text-sidebar-foreground hover:text-primary flex items-center gap-3 px-6 pt-8 transition-colors"
      >
        <div className="relative size-11 overflow-hidden">
          <img
            src="/assets/logo.svg"
            alt="Leadly Logo"
            className="size-full object-contain dark:hidden"
          />
          <img
            src="/assets/logo-dark.svg"
            alt="Leadly Logo"
            className="hidden size-full object-contain dark:block"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm leading-tight font-semibold">Leadly</span>
          <span className="text-muted-foreground text-xs">
            Growth intelligence
          </span>
        </div>
      </Link>

      <div className="px-4 pt-6">
        <ProductModeToggle
          mode={productMode}
          onModeChange={setProductMode}
          className="w-full"
        />
      </div>

      <div className="px-4 pt-6 pb-6">
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

        <BugReportDialog />

        <section className="border-sidebar-border bg-sidebar/50 group hover:bg-primary/5 rounded-2xl border p-1 text-xs shadow-sm backdrop-blur transition-colors">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-3 px-3 py-2 font-medium transition-colors"
          >
            <div className="bg-primary/10 group-hover:bg-primary/20 flex size-8 items-center justify-center rounded-xl transition-colors">
              <LifeBuoy className="text-primary size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sidebar-foreground text-sm">
                Help & Support
              </span>
              <span className="text-muted-foreground text-[10px]">
                {SUPPORT_EMAIL}
              </span>
            </div>
          </a>
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
        className="border-sidebar-border bg-sidebar/90 hidden w-72 shrink-0 border-r shadow-[inset_-1px_0px_rgba(119,51,68,0.05)] backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden"
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={restartWalkthrough}
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 size-9 rounded-full"
                    aria-label="Show walkthrough guide"
                  >
                    <HelpCircle className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show walkthrough guide</p>
                </TooltipContent>
              </Tooltip>
              <ModeToggle />
              <Badge
                variant="outline"
                className="border-primary/30 text-primary hidden sm:inline-flex"
              >
                {tierLabel} tier
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 size-9 rounded-full"
                    aria-label="Open profile menu"
                  >
                    <User className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {resolvedName}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {resolvedEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href={`mailto:${SUPPORT_EMAIL}`}>
                      <LifeBuoy className="size-4" />
                      Help & Support
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account">
                      <User className="size-4" />
                      Account settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/billing">
                      <CreditCard className="size-4" />
                      Billing & plans
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild variant="destructive">
                    <LogoutButton
                      variant="ghost"
                      className="h-auto w-full justify-start p-1 font-normal"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </LogoutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  src="/assets/logo.svg"
                  alt="Leadly Logo"
                  className="size-full object-contain dark:hidden"
                />
                <img
                  src="/assets/logo-dark.svg"
                  alt="Leadly Logo"
                  className="hidden size-full object-contain dark:block"
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

          <div className="px-4 pt-4">
            <ProductModeToggle
              mode={productMode}
              onModeChange={setProductMode}
              className="w-full"
            />
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
            <BugReportDialog />

            <section className="border-sidebar-border bg-sidebar/50 group hover:bg-primary/5 rounded-2xl border p-1 text-xs shadow-sm backdrop-blur transition-colors">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-3 px-3 py-2 font-medium transition-colors"
              >
                <div className="bg-primary/10 group-hover:bg-primary/20 flex size-8 items-center justify-center rounded-xl transition-colors">
                  <LifeBuoy className="text-primary size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sidebar-foreground text-sm">
                    Help & Support
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {SUPPORT_EMAIL}
                  </span>
                </div>
              </a>
            </section>

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
