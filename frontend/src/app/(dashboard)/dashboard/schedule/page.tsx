import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { ScheduleForm } from "@/components/schedule/schedule-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSchedule, getScheduleLimits } from "@/lib/backend-queries";
import { formatHourList } from "@/lib/format";

export const metadata = {
  title: "Schedule · Leadly",
};

export default async function SchedulePage() {
  const [schedule, limits] = await Promise.all([
    getSchedule(),
    getScheduleLimits(),
  ]);

  const scheduledHours = schedule?.scheduledHours ?? [];
  const tierLabel = limits
    ? limits.tier.toLowerCase().replace(/^\w/, (char) => char.toUpperCase())
    : "Free";

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Scrape schedule"
        description="Control when Leadly scrapes each monitor. Leadly respects plan limits so you stay compliant while covering the hours that matter."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          <ScheduleForm
            scheduledHours={scheduledHours}
            maxSelectable={limits?.limits.selectableHours ?? 1}
          />
        </section>
        <aside className="space-y-4">
          <Card className="border-border/60 bg-background/85">
            <CardHeader>
              <CardTitle>Plan limits</CardTitle>
              <CardDescription>
                Your workspace is on the {tierLabel} tier.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Monitors</span>
                <span>{limits?.limits.monitors ?? 3}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Scrapes per day</span>
                <span>{limits?.limits.scrapesPerDay ?? 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Selectable hours</span>
                <span>{limits?.limits.selectableHours ?? 1}</span>
              </div>
              <p className="text-xs">
                We will introduce upgrade flows soon. Billing and plan management UI is
                already wired for when payments go live.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/85">
            <CardHeader>
              <CardTitle>Current schedule</CardTitle>
              <CardDescription>
                These windows are used until you make changes above.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {scheduledHours.length > 0 ? (
                <>
                  <Badge variant="outline">
                    {scheduledHours.length} {scheduledHours.length === 1 ? "window" : "windows"}
                  </Badge>
                  <p className="leading-relaxed">
                    {formatHourList(scheduledHours)}
                  </p>
                </>
              ) : (
                <p>No schedule yet. Select at least one hour to begin scraping.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
