import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { CreateMonitorForm } from "@/components/monitors/create-monitor-form";
import { getIcps } from "@/lib/backend-queries";
import { MonitorGrid } from "@/components/monitors/monitor-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { Radar } from "lucide-react";

export async function MonitorsContent() {
  const icps = await getIcps();
  const icpOptions = icps.map((icp) => ({
    id: icp.id,
    name: icp.name,
    platform: icp.platform,
    summary: icp.summary,
    targetPersona: icp.targetPersona,
    pains: icp.pains,
    valueProposition: icp.valueProposition,
    qualifyingSignals: icp.qualifyingSignals,
    disqualifyingSignals: icp.disqualifyingSignals,
  }));
  const icpLookup = Object.fromEntries(
    icpOptions.map((icp) => [icp.id, icp]),
  ) as Record<string, (typeof icpOptions)[number]>;

  const monitorList = icps.flatMap((icp) =>
    icp.monitors.map((monitor) => {
      const lastJob = monitor.scrapeJobs[0];
      const totalWarm = monitor.scrapeJobs.reduce(
        (acc, job) => acc + job.warmLeads,
        0,
      );
      const totalLeads = monitor.scrapeJobs.reduce(
        (acc, job) => acc + job.warmLeads + job.coldLeads + job.neutralLeads,
        0,
      );

      return {
        ...monitor,
        icpName: icp.name,
        icpDetails: icpLookup[icp.id],
        totalWarm,
        totalLeads,
        lastScrapeTime: lastJob?.completedAt,
      };
    }),
  );

  const hasIcps = icps.length > 0;
  const hasMonitors = monitorList.length > 0;

  // When no ICPs, show full-width empty state without the form
  if (!hasIcps) {
    return (
      <div className="flex flex-col gap-8">
        <DashboardPageHeader
          title="Monitors"
          description="Monitors listen to specific communities, subreddits, or keywords. Leadly enforces tier limits automatically and keeps the ten most recent scrape jobs for each monitor."
        />

        <EmptyState
          icon={<Radar className="h-8 w-8" />}
          title="Create an ICP first"
          description="Before creating monitors, you need at least one Ideal Customer Profile (ICP). ICPs help Leadly understand which conversations matter most to you."
          action={{
            label: "Create ICP",
            href: "/dashboard/icps/create",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Monitors"
        description="Monitors listen to specific communities, subreddits, or keywords. Leadly enforces tier limits automatically and keeps the ten most recent scrape jobs for each monitor."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section id="monitor-list" className="space-y-6">
          {!hasMonitors ? (
            <EmptyState
              icon={<Radar className="h-8 w-8" />}
              title="No monitors yet"
              description="Set up a monitor to start tracking high-intent conversations in your target communities. Each monitor scans a specific subreddit for keywords matching your ICP."
            />
          ) : (
            <MonitorGrid
              monitors={monitorList}
              icpOptions={icpOptions.map(({ id, name, platform }) => ({
                id,
                name,
                platform,
              }))}
            />
          )}
        </section>
        <aside
          id="create-monitor-form"
          className="lg:sticky lg:top-24 lg:h-fit"
        >
          <CreateMonitorForm
            icps={icpOptions.map(({ id, name, platform }) => ({
              id,
              name,
              platform,
            }))}
          />
        </aside>
      </div>
    </div>
  );
}
