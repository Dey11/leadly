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
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";

const iconComponents = {
  overview: LayoutDashboard,
  icps: Layers,
  monitors: Radar,
  leads: Sparkles,
  schedule: CalendarClock,
  account: UserRound,
  billing: CreditCard,
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
            {variant === "sidebar" ? (
              <span
                className={cn(
                  "absolute left-2 top-1/2 hidden h-7 w-1.5 -translate-y-1/2 rounded-full bg-primary/70 transition-opacity lg:block",
                  isActive ? "opacity-100" : "opacity-0",
                )}
                aria-hidden
              />
            ) : null}
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
      onChange={(event) => {
        const value = event.target.value;
        if (value && value !== pathname) {
          router.push(value);
        }
        onNavigate?.();
      }}
    >
      {!activeItem ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {items.map((item) => (
        <option key={item.href} value={item.href}>
          {item.label}
        </option>
      ))}
    </Select>
  );
}
