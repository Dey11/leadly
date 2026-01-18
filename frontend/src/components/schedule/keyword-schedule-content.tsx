import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { CurrentScheduleCard } from "@/components/schedule/current-schedule-card";
import { ScheduleForm } from "@/components/schedule/schedule-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getKeywordSchedule, getScheduleLimits } from "@/lib/backend-queries";

export async function KeywordScheduleContent() {
  const [schedule, limits] = await Promise.all([
    getKeywordSchedule(),
    getScheduleLimits(),
  ]);

  const scheduledHours = schedule?.scheduledHours ?? [];
  const tierLabel = limits
    ? limits.tier.toLowerCase().replace(/^\w/, (char) => char.toUpperCase())
    : "Free";

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Keyword scrape schedule"
        description="Control when Leadly scrapes your keyword monitors. Set times to monitor subreddits for your keywords."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section id="schedule-form" className="space-y-4">
          <ScheduleForm
            scheduledHours={scheduledHours}
            maxSelectable={limits?.limits.selectableHours ?? 1}
          />
        </section>
        <aside id="plan-limits" className="space-y-4">
          <Card className="border-border/60 bg-background/85">
            <CardHeader>
              <CardTitle>Plan limits</CardTitle>
              <CardDescription>
                Your workspace is on the {tierLabel} tier.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">Monitors</span>
                <span>{limits?.limits.monitors ?? 3}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">
                  Scrapes per day
                </span>
                <span>{limits?.limits.scrapesPerDay ?? 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">
                  Selectable hours
                </span>
                <span>{limits?.limits.selectableHours ?? 1}</span>
              </div>
              <p className="text-xs">
                We will introduce upgrade flows soon. Billing and plan
                management UI is already wired for when payments go live.
              </p>
            </CardContent>
          </Card>

          <CurrentScheduleCard scheduledHours={scheduledHours} />
        </aside>
      </div>
    </div>
  );
}
