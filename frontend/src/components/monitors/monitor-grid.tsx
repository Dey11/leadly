"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelative } from "@/lib/format";
import { Monitor, SubscriptionTier } from "@/types/backend";
import {
  DeleteMonitorButton,
  ToggleMonitorStatusButton,
} from "./monitor-actions";
import { EditMonitorDialog } from "./edit-monitor-dialog";
import { MonitorIcpDialog } from "./monitor-icp-dialog";
import { Activity, PauseCircle } from "lucide-react";

interface MonitorGridItem extends Monitor {
  icpName: string;
  totalWarm: number;
  totalLeads: number;
  lastScrapeTime?: string | null;
  icpDetails?: any;
}

interface MonitorGridProps {
  monitors: MonitorGridItem[];
  icpOptions: any[]; // For EditDialog
  tier?: SubscriptionTier;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  ACTIVE: {
    label: "Active",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    icon: Activity,
  },
  PAUSED: {
    label: "Paused",
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    icon: PauseCircle,
  },
  ARCHIVED: {
    label: "Archived",
    color: "bg-muted text-muted-foreground border-transparent",
    icon: PauseCircle,
  },
};

export function MonitorGrid({
  monitors,
  icpOptions,
  tier = "FREE",
}: MonitorGridProps) {
  if (monitors.length === 0) {
    return (
      <Card className="bg-muted/5 flex flex-col items-center justify-center border-2 border-dashed px-6 py-16">
        <div className="bg-primary/10 text-primary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Activity className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">No active monitors</h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-center leading-relaxed">
          You aren't tracking any subreddits yet. Set up a monitor to start
          finding leads.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {monitors.map((monitor) => {
        const config = statusConfig[monitor.status] || statusConfig.ACTIVE;
        const Icon = config.icon;

        return (
          <Card
            key={monitor.id}
            className="group border-border/40 hover:border-border/80 bg-card/40 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base leading-none font-medium">
                      {monitor.target}
                    </CardTitle>
                    {monitor.platform === "REDDIT" && (
                      <span className="rounded bg-[#FF4500]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#FF4500]">
                        Reddit
                      </span>
                    )}
                    {monitor.targetType === "CUSTOM_FEED" && (
                      <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] font-medium">
                        List
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Tracking for {monitor.icpName}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`gap-1.5 ${config.color} border px-2 py-0.5`}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Warm Leads
                  </p>
                  <p className="text-lg font-semibold">{monitor.totalWarm}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Last Scrape
                  </p>
                  <p className="text-sm font-medium">
                    {monitor.lastScrapeTime
                      ? formatRelative(monitor.lastScrapeTime)
                      : "Pending"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-border/40 flex justify-between gap-2 overflow-x-auto border-t pt-3">
              <div className="flex gap-2">
                <ToggleMonitorStatusButton
                  monitorId={monitor.id}
                  status={monitor.status as any}
                />
                <EditMonitorDialog
                  monitor={monitor}
                  icps={icpOptions}
                  tier={tier}
                />
              </div>
              <div className="flex gap-2">
                {monitor.icpDetails && (
                  <MonitorIcpDialog
                    monitorName={monitor.target}
                    icp={monitor.icpDetails}
                  />
                )}
                <DeleteMonitorButton monitorId={monitor.id} />
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
