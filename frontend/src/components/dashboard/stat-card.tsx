import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TrendTone = "positive" | "negative" | "neutral";

type DashboardStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  trendLabel?: string;
  trendTone?: TrendTone;
  className?: string;
};

const trendStyles: Record<TrendTone, string> = {
  positive: "bg-primary/15 text-primary",
  negative: "bg-[rgba(187,47,66,0.1)] text-[#bb2f42]",
  neutral: "bg-secondary/30 text-foreground",
};

export function DashboardStatCard({
  icon: Icon,
  label,
  value,
  hint,
  trendLabel,
  trendTone = "neutral",
  className,
}: DashboardStatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-sm backdrop-blur", className)}>
      <div className="pointer-events-none absolute -right-5 top-0 h-24 w-24 rounded-full bg-primary/15 blur-3xl" />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </CardTitle>
          {trendLabel ? (
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                trendStyles[trendTone],
              )}
            >
              <span className="inline-block size-2 rounded-full bg-current" />
              {trendLabel}
            </span>
          ) : null}
        </div>
        <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-sm">
          <Icon className="size-5" aria-hidden />
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-semibold text-foreground md:text-4xl">
          {value}
        </p>
        {hint ? (
          <CardDescription className="text-sm leading-relaxed">
            {hint}
          </CardDescription>
        ) : null}
      </CardContent>
    </Card>
  );
}
