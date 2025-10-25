"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  LayoutDashboard,
  Layers,
  Radar,
  Sparkles,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

const iconComponents = {
  overview: LayoutDashboard,
  services: Layers,
  monitors: Radar,
  leads: Sparkles,
  schedule: CalendarClock,
  account: UserRound,
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
};

export function DashboardNav({
  items,
  orientation = "vertical",
  onNavigate,
}: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-1",
        orientation === "vertical"
          ? "flex-col"
          : "flex-row overflow-x-auto pb-2"
      )}
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = iconComponents[item.icon];

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              "hover:bg-primary/10 hover:text-primary",
              isActive
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-4 transition-transform",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
            <span className="truncate">{item.label}</span>
            {item.badge ? (
              <span className="ml-auto rounded-full bg-primary/10 px-2 py-[2px] text-xs font-semibold text-primary">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
