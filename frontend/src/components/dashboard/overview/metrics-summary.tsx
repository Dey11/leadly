import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  MessageSquare,
  Zap,
} from "lucide-react";
import { FadeInStagger, FadeInItem } from "@/components/shared/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Metric {
  label: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ElementType;
}

export function MetricsSummary() {
  // Mock data for initial implementation - will replace with real props later
  const metrics: Metric[] = [
    {
      label: "Qualified Leads",
      value: "28",
      trend: { value: "+12%", isPositive: true },
      icon: Zap,
    },
    {
      label: "Active Conversations",
      value: "145",
      trend: { value: "+5%", isPositive: true },
      icon: MessageSquare,
    },
    {
      label: "Schedule Usage",
      value: "82%",
      trend: { value: "+2%", isPositive: false }, // Using false to show neutral or different color if needed, typically high usage is good but close to limit is warning
      icon: Users,
    },
  ];

  return (
    <FadeInStagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {metrics.map((metric, i) => (
        <FadeInItem key={i}>
          <Card className="border-border/40 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {metric.label}
              </CardTitle>
              <metric.icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.trend && (
                <p
                  className={`mt-1 flex items-center text-xs ${metric.trend.isPositive ? "text-green-500" : "text-muted-foreground"}`}
                >
                  {metric.trend.isPositive ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  {metric.trend.value}
                  <span className="text-muted-foreground ml-1">
                    from last week
                  </span>
                </p>
              )}
            </CardContent>
          </Card>
        </FadeInItem>
      ))}
    </FadeInStagger>
  );
}
