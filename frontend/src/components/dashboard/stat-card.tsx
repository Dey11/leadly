import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
};

export function DashboardStatCard({ icon: Icon, label, value, hint }: DashboardStatCardProps) {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-semibold text-foreground">{value}</p>
        {hint ? (
          <CardDescription className="text-sm leading-relaxed">
            {hint}
          </CardDescription>
        ) : null}
      </CardContent>
    </Card>
  );
}
