import Link from "next/link";
import {
  Flame,
  Layers,
  ListChecks,
  Radar,
  Sparkles,
  Users,
} from "lucide-react";
import { RefreshController } from "@/components/shared/refresh-controller";

import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardScheduleCard } from "@/components/dashboard/schedule-card";
import { DashboardSpotlightCards } from "@/components/dashboard/spotlight-cards";
import { DashboardStatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAccountSessions,
  getIcps,
  getLeads,
  getSchedule,
} from "@/lib/backend-queries";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { Icp, LeadSummary, Monitor, ScrapeJob } from "@/types/backend";
import {
  numberFormatter,
  LEAD_TYPE_STYLES,
  LEAD_STATUS_STYLES,
  LEAD_PROGRESS_STYLES,
  LEAD_DOT_STYLES,
  JOB_STATUS_STYLES,
} from "@/constants/dashboard";

type MonitorWithIcp = Monitor & { icpName?: string };
type JobWithContext = ScrapeJob & {
  icpName: string;
  monitorTarget: string;
};

function collectMonitors(icps: Icp[]): MonitorWithIcp[] {
  return icps.flatMap((icp) =>
    icp.monitors.map((monitor) => ({
      ...monitor,
      icpName: icp.name,
    })),
  );
}

function collectJobs(monitors: MonitorWithIcp[]): JobWithContext[] {
  return monitors.flatMap((monitor) =>
    monitor.scrapeJobs.map((job) => ({
      ...job,
      icpName: monitor.icp?.name ?? monitor.icpName ?? "ICP",
      monitorTarget: monitor.target,
    })),
  );
}

function summarizeLeads(jobs: ScrapeJob[]) {
  return jobs.reduce(
    (acc, job) => {
      acc.warm += job.warmLeads;
      acc.cold += job.coldLeads;
      acc.neutral += job.neutralLeads;
      return acc;
    },
    { warm: 0, cold: 0, neutral: 0 },
  );
}

export async function OverviewContent() {
  const [icps, schedule, sessions, leadsPayload] = await Promise.all([
    getIcps(),
    getSchedule(),
    getAccountSessions(),
    getLeads({ limit: 5, page: 1 }),
  ]);

  const monitors = collectMonitors(icps);
  const allJobs = collectJobs(monitors).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Stats should reflect a true 7-day window
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const statsJobs = allJobs.filter(
    (job) => new Date(job.createdAt) >= sevenDaysAgo,
  );
  const leadSummary = summarizeLeads(statsJobs);

  // Table stays concise with only the last 6 entries
  const recentJobs = allJobs.slice(0, 6);

  const leadsPayloadData = leadsPayload?.data ?? [];
  const totalLeads = leadsPayload?.pagination.total ?? 0;

  const activeMonitorCount = monitors.filter(
    (monitor) => monitor.status === "ACTIVE",
  ).length;
  const pausedMonitorCount = monitors.filter(
    (monitor) => monitor.status === "PAUSED",
  ).length;
  const activeIcpCount = icps.filter((icp) => icp.status === "ACTIVE").length;
  const averageMonitorsPerIcp =
    icps.length > 0 ? (monitors.length / icps.length).toFixed(1) : "0.0";

  const lastCompletedJob =
    allJobs.find((job) => job.completedAt) ?? allJobs.at(0) ?? null;
  const lastCompletedLabel = lastCompletedJob?.completedAt
    ? formatRelative(lastCompletedJob.completedAt)
    : "Awaiting first completion";
  const jobVolumeLabel = lastCompletedJob
    ? `${lastCompletedJob.warmLeads} warm · ${lastCompletedJob.neutralLeads} neutral`
    : "No job volume yet.";

  const latestWarmLeads = allJobs[0]?.warmLeads ?? 0;
  const previousWarmLeads = allJobs[1]?.warmLeads ?? 0;
  const warmDelta = latestWarmLeads - previousWarmLeads;
  const warmTrendLabel =
    allJobs.length > 1
      ? `${warmDelta >= 0 ? "+" : ""}${warmDelta} vs last run`
      : "Baseline run";
  const warmTrendTone: "positive" | "negative" | "neutral" =
    warmDelta > 0 ? "positive" : warmDelta < 0 ? "negative" : "neutral";

  const newLeadsCount = leadsPayloadData.length;
  const totalTrendLabel =
    newLeadsCount > 0
      ? `+${newLeadsCount} surfaced recently`
      : "No new leads yet";
  const totalTrendTone: "positive" | "negative" | "neutral" =
    newLeadsCount > 0 ? "positive" : "neutral";

  const monitorsTrendLabel =
    monitors.length === 0
      ? "Add monitors"
      : pausedMonitorCount > 0
        ? `${activeMonitorCount} live · ${pausedMonitorCount} paused`
        : `${activeMonitorCount} live monitors`;
  const monitorsTrendTone: "positive" | "negative" | "neutral" =
    monitors.length === 0
      ? "neutral"
      : pausedMonitorCount === 0
        ? "positive"
        : "neutral";

  const icpsTrendLabel =
    icps.length === 0
      ? "Define your first ICP"
      : `${averageMonitorsPerIcp} monitors per ICP`;
  const icpsTrendTone: "positive" | "negative" | "neutral" =
    icps.length > 0 && activeIcpCount === icps.length ? "positive" : "neutral";

  const metrics = [
    {
      label: "ICPs",
      value: numberFormatter.format(icps.length),
      hint:
        icps.length > 0
          ? `~${averageMonitorsPerIcp} monitors per profile.`
          : "Start by defining an ideal customer profile.",
      icon: Layers,
      trendLabel: icpsTrendLabel,
      trendTone: icpsTrendTone,
    },
    {
      label: "Monitors",
      value: numberFormatter.format(monitors.length),
      hint: "Listening posts across your ICPs.",
      icon: Radar,
      trendLabel: monitorsTrendLabel,
      trendTone: monitorsTrendTone,
    },
    {
      label: "Warm leads (7d)",
      value: numberFormatter.format(leadSummary.warm),
      hint: "Qualified conversations in the recent past.",
      icon: Flame,
      trendLabel: warmTrendLabel,
      trendTone: warmTrendTone,
    },
    {
      label: "Total leads",
      value: numberFormatter.format(totalLeads),
      hint: "All opportunities discovered to date.",
      icon: Users,
      trendLabel: totalTrendLabel,
      trendTone: totalTrendTone,
    },
  ];

  const leadBreakdown = [
    { label: "Warm", value: leadSummary.warm, type: "WARM" as const },
    { label: "Neutral", value: leadSummary.neutral, type: "NEUTRAL" as const },
    { label: "Cold", value: leadSummary.cold, type: "COLD" as const },
  ];

  const leadBreakdownTotal = leadBreakdown.reduce(
    (total, segment) => total + segment.value,
    0,
  );
  const leadHealthScore =
    leadBreakdownTotal > 0
      ? Math.round((leadSummary.warm / leadBreakdownTotal) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <RefreshController />
      <RefreshController />
      <section className="border-border/40 bg-card/60 relative overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur-md md:p-8">
        <div className="bg-primary/10 pointer-events-none absolute top-0 -right-10 h-64 w-64 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col gap-6">
          <DashboardPageHeader
            title="Workspace overview"
            description="Monitor high-signal conversations, review scheduled scrapes, and jump back into leads that need attention."
            action={
              <Button asChild className="shadow-primary/20 shadow-lg">
                <Link href="/dashboard/leads">Open leads workspace</Link>
              </Button>
            }
          />

          <DashboardSpotlightCards
            schedule={schedule}
            lastCompletedLabel={lastCompletedLabel}
            jobVolumeLabel={jobVolumeLabel}
            activeMonitorCount={activeMonitorCount}
            icpCount={icps.length}
            monitorCount={monitors.length}
          />
        </div>
      </section>

      <section
        id="dashboard-metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <DashboardStatCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            trendLabel={metric.trendLabel}
            trendTone={metric.trendTone}
            className="bg-card/70 border-border/40 backdrop-blur-sm"
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <Card
          id="recent-activity"
          className="border-border/60 bg-card/95 overflow-hidden rounded-3xl border shadow-sm"
        >
          <CardHeader className="border-border/50 flex flex-col gap-3 border-b pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Recent scrape activity</CardTitle>
              <CardDescription>
                Monitor performance across your latest jobs.
              </CardDescription>
            </div>
            <Button variant="outline" asChild size="sm">
              <Link href="/dashboard/monitors">Manage monitors</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 text-xs tracking-wide uppercase hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold">
                    Monitor
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold">
                    ICP
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center font-semibold">
                    Warm
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center font-semibold">
                    Neutral
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center font-semibold">
                    Cold
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right font-semibold">
                    Completed
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobs.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="py-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                          <ListChecks className="text-muted-foreground/50 h-6 w-6" />
                        </div>
                        <p className="text-foreground font-medium">
                          No scrape activity yet
                        </p>
                        <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                          Once your monitors are active, recent scrape jobs and
                          their results will appear here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentJobs.map((job) => (
                    <TableRow key={job.id} className="border-border/40">
                      <TableCell className="text-foreground font-medium">
                        {job.monitorTarget}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {job.icpName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${JOB_STATUS_STYLES[job.status]} capitalize`}
                        >
                          {job.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-primary text-center font-semibold">
                        {job.warmLeads}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center">
                        {job.neutralLeads}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center">
                        {job.coldLeads}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right">
                        {job.completedAt
                          ? formatRelative(job.completedAt)
                          : "Pending"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
            <CardHeader>
              <CardTitle>Lead quality mix</CardTitle>
              <CardDescription>
                Warmth distribution across the latest scrape cycles.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-5 text-sm">
              <div className="border-border/60 bg-background/85 flex items-center justify-between rounded-2xl border px-4 py-3">
                <div>
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Lead health score
                  </p>
                  <p className="text-foreground mt-1 text-2xl font-semibold">
                    {leadHealthScore}%
                  </p>
                  <p className="text-xs">
                    Portion of warm leads across total captured.
                  </p>
                </div>
                <div className="border-primary/30 bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full border text-sm font-semibold">
                  {leadHealthScore}%
                </div>
              </div>

              <div className="bg-secondary/30 flex h-2 w-full overflow-hidden rounded-full">
                {leadBreakdown.map((segment) => (
                  <span
                    key={segment.type}
                    className={`${LEAD_PROGRESS_STYLES[segment.type]} h-full`}
                    style={{
                      width:
                        leadBreakdownTotal > 0
                          ? `${(segment.value / leadBreakdownTotal) * 100}%`
                          : "0%",
                    }}
                  />
                ))}
              </div>

              <div className="space-y-3 text-sm">
                {leadBreakdown.map((segment) => (
                  <div
                    key={segment.type}
                    className="border-border/60 bg-background/85 flex items-center justify-between rounded-2xl border px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`${LEAD_DOT_STYLES[segment.type]} size-2.5 rounded-full`}
                        aria-hidden
                      />
                      <Badge className={LEAD_TYPE_STYLES[segment.type]}>
                        {segment.label}
                      </Badge>
                    </div>
                    <span className="text-foreground text-sm font-semibold">
                      {numberFormatter.format(segment.value)}
                    </span>
                  </div>
                ))}
              </div>

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/dashboard/leads">Review all leads</Link>
              </Button>
            </CardContent>
          </Card>

          <DashboardScheduleCard schedule={schedule} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
          <CardHeader className="border-border/50 border-b pb-6">
            <CardTitle>Recent leads</CardTitle>
            <CardDescription>
              Highlights from the latest scrape cycles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {leadsPayloadData.length === 0 ? (
              <div className="border-border/60 bg-background/80 text-muted-foreground rounded-2xl border p-6 text-center text-sm">
                No leads yet. Once your monitors finish scraping, new leads will
                appear here.
              </div>
            ) : (
              leadsPayloadData.map((lead) => (
                <div
                  key={lead.id}
                  className="border-border/60 bg-background/85 rounded-2xl border p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`${LEAD_DOT_STYLES[lead.leadType]} size-2.5 rounded-full`}
                        aria-hidden
                      />
                      <Badge className={LEAD_TYPE_STYLES[lead.leadType]}>
                        {lead.leadType}
                      </Badge>
                      <Badge className={LEAD_STATUS_STYLES[lead.status]}>
                        {lead.status}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {formatRelative(lead.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground mt-3 text-sm leading-relaxed">
                    {lead.content}
                  </p>
                  <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 capitalize">
                      <Sparkles className="text-primary size-3.5" aria-hidden />
                      {lead.platform.toLowerCase()}
                    </span>
                    <Link
                      className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-medium transition"
                      href="/dashboard/leads"
                    >
                      Manage lead
                      <ListChecks className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              ))
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/leads">Open leads workspace</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
            <CardDescription>Devices currently authenticated.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            {sessions.length === 0 ? (
              <p>No other sessions detected.</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="border-border/60 bg-background/85 rounded-2xl border px-4 py-3"
                >
                  <p className="text-foreground font-medium">
                    {session.userAgent ?? "Session"}
                  </p>
                  <p className="text-xs">
                    Expires {formatDateTime(session.expiresAt)}
                  </p>
                </div>
              ))
            )}
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/dashboard/account">Manage sessions</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
