import { DashboardPageHeader } from "@/components/dashboard/page-header";
import {
  DeleteMonitorButton,
  ToggleMonitorStatusButton,
} from "@/components/monitors/monitor-actions";
import { CreateMonitorForm } from "@/components/monitors/create-monitor-form";
import { EditMonitorDialog } from "@/components/monitors/edit-monitor-dialog";
import { Badge } from "@/components/ui/badge";
import { MonitorIcpDialog } from "@/components/monitors/monitor-icp-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIcps } from "@/lib/backend-queries";
import { formatDateTime, formatRelative } from "@/lib/format";

const statusMap: Record<string, { label: string; variant: "default" | "outline" | "success" | "warning" }> =
  {
    ACTIVE: { label: "Active", variant: "success" },
    PAUSED: { label: "Paused", variant: "warning" },
    ARCHIVED: { label: "Archived", variant: "outline" },
  };

export const metadata = {
  title: "Monitors · Leadly",
};

export default async function MonitorsPage() {
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
    icp.monitors.map((monitor) => ({
      ...monitor,
      icpName: icp.name,
      icpDetails: icpLookup[icp.id],
    })),
  );

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Monitors"
        description="Monitors listen to specific communities, subreddits, or keywords. Leadly enforces tier limits automatically and keeps the ten most recent scrape jobs for each monitor."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="grid gap-6">
            {monitorList.length === 0 ? (
              <Card className="border-border/60 bg-background/85">
                <CardHeader>
                  <CardTitle>No monitors yet</CardTitle>
                  <CardDescription>
                    Add a monitor to start discovering leads from your selected
                    communities.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              monitorList.map((monitor) => {
                const status = statusMap[monitor.status] ?? statusMap.ACTIVE;
                const lastJob = monitor.scrapeJobs[0];
                const totalWarm = monitor.scrapeJobs.reduce(
                  (acc, job) => acc + job.warmLeads,
                  0,
                );
                const totalLeads = monitor.scrapeJobs.reduce(
                  (acc, job) =>
                    acc + job.warmLeads + job.coldLeads + job.neutralLeads,
                  0,
                );

                return (
                  <Card key={monitor.id} className="border-border/60 bg-background/85">
                    <CardHeader className="gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <CardTitle className="text-lg text-foreground">
                          {monitor.target}
                        </CardTitle>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <CardDescription className="flex flex-wrap items-center gap-4 text-xs">
                        <span>ICP · {monitor.icpName}</span>
                        <span>Platform · {monitor.platform}</span>
                        <span>
                          Last updated · {formatRelative(monitor.updatedAt)}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                      <div className="grid gap-2 rounded-2xl bg-secondary/30 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            Warm leads (lifetime)
                          </span>
                          <span className="font-semibold text-primary">
                            {totalWarm}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            Total leads captured
                          </span>
                          <span>{totalLeads}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            Last scrape
                          </span>
                          <span>
                            {lastJob?.completedAt
                              ? `${formatDateTime(lastJob.completedAt)} (${formatRelative(lastJob.completedAt)})`
                              : "Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Recent jobs
                        </p>
                        {monitor.scrapeJobs.length === 0 ? (
                          <p>No scrape jobs have run yet.</p>
                        ) : (
                          <ul className="space-y-2">
                            {monitor.scrapeJobs.slice(0, 3).map((job) => (
                              <li
                                key={job.id}
                                className="flex items-center justify-between rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-xs"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground">
                                    {job.status}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {job.completedAt
                                      ? formatRelative(job.completedAt)
                                      : "In progress"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-primary">
                                    {job.warmLeads} warm
                                  </span>
                                  <span>{job.coldLeads} cold</span>
                                  <span>{job.neutralLeads} neutral</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap items-center gap-3">
                      <ToggleMonitorStatusButton
                        monitorId={monitor.id}
                        status={monitor.status}
                      />
                      <EditMonitorDialog
                        monitor={monitor}
                        icps={icpOptions.map(({ id, name, platform }) => ({
                          id,
                          name,
                          platform,
                        }))}
                      />
                      <DeleteMonitorButton monitorId={monitor.id} />
                      {monitor.icpDetails ? (
                        <MonitorIcpDialog
                          monitorName={monitor.target}
                          icp={monitor.icpDetails}
                        />
                      ) : null}
                    </CardFooter>
                  </Card>
                )
              })
            )}
          </div>
        </section>
        <aside className="lg:sticky lg:top-24 lg:h-fit">
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
