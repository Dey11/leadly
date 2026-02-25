"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  Layers,
  Radar,
  Sparkles,
  UserRound,
  Tags,
  Search,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const iconComponents = {
  overview: LayoutDashboard,
  icps: Layers,
  monitors: Radar,
  leads: Sparkles,
  schedule: CalendarClock,
  account: UserRound,
  billing: CreditCard,
  keywordSets: Tags,
  keywordMonitors: Radar,
  keywordLeads: Search,
  settings: Settings,
} as const;

export type IconKey = keyof typeof iconComponents;

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: IconKey;
  badge?: string;
};

type DashboardNavProps = {
  items: DashboardNavItem[];
  orientation?: "vertical" | "horizontal";
  onNavigate?: () => void;
  variant?: "sidebar" | "toolbar";
  className?: string;
};

export function DashboardNav({
  items,
  orientation = "vertical",
  onNavigate,
  variant = "sidebar",
  className,
}: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-1",
        orientation === "vertical"
          ? "flex-col"
          : "flex-row overflow-x-auto pb-2",
        className,
      )}
    >
      {items.map((item) => {
        // For exact matches or startsWith check, but exclude if another nav item is a more specific match
        const isExactMatch = pathname === item.href;
        const isNestedMatch =
          item.href !== "/dashboard" && pathname.startsWith(item.href + "/");
        // Check if there's a more specific item that matches (to avoid both Account and Settings being active)
        const hasMoreSpecificMatch = items.some(
          (other) =>
            other.href !== item.href &&
            other.href.startsWith(item.href) &&
            (pathname === other.href || pathname.startsWith(other.href + "/")),
        );
        const isActive =
          isExactMatch || (isNestedMatch && !hasMoreSpecificMatch);
        const Icon = iconComponents[item.icon];

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all",
              variant === "sidebar"
                ? "hover:bg-primary/10 hover:text-primary"
                : "hover:bg-primary/15 hover:text-primary",
              isActive
                ? variant === "sidebar"
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4 transition-transform",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-primary",
              )}
              aria-hidden="true"
            />
            <span className="truncate">{item.label}</span>
            {item.badge ? (
              <span className="bg-primary/10 text-primary ml-auto rounded-full px-2 py-[2px] text-xs font-semibold">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

type DashboardNavSelectProps = {
  items: DashboardNavItem[];
  placeholder?: string;
  onNavigate?: () => void;
};

export function DashboardNavSelect({
  items,
  placeholder = "Navigate",
  onNavigate,
}: DashboardNavSelectProps) {
  const router = useRouter();
  const pathname = usePathname();

  const activeItem =
    items.find((item) => pathname === item.href) ??
    items.find(
      (item) => item.href !== "/dashboard" && pathname.startsWith(item.href),
    ) ??
    items[0];

  return (
    <Select
      value={activeItem?.href ?? ""}
      onValueChange={(value) => {
        if (value && value !== pathname) {
          router.push(value);
        }
        onNavigate?.();
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.href} value={item.href}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
