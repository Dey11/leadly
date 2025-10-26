import Link from "next/link";
import { Flame, Layers, ListChecks, Radar, Target, Users } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/page-header";
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
  getAccountSessions,
  getLeads,
  getSchedule,
  getServices,
} from "@/lib/backend-queries";
import { formatDateTime, formatHourList, formatRelative } from "@/lib/format";
import type {
  LeadStatus,
  LeadSummary,
  LeadType,
  Monitor,
  ScrapeJob,
  Service,
} from "@/types/backend";

type MonitorWithService = Monitor & { serviceName?: string };
type JobWithContext = ScrapeJob & {
  serviceName: string;
  monitorTarget: string;
};

function collectMonitors(services: Service[]): MonitorWithService[] {
  return services.flatMap((service) =>
    service.monitors.map((monitor) => ({
      ...monitor,
      serviceName: service.name,
    })),
  );
}

function collectJobs(monitors: MonitorWithService[]): JobWithContext[] {
  return monitors.flatMap((monitor) =>
    monitor.scrapeJobs.map((job) => ({
      ...job,
      serviceName: monitor.service?.name ?? monitor.serviceName ?? "Service",
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

export const metadata = {
  title: "Dashboard · Leadly",
};

export default async function DashboardHome() {
  const [services, schedule, sessions, leadsPayload] = await Promise.all([
    getServices(),
    getSchedule(),
    getAccountSessions(),
    getLeads({ limit: 5, page: 1 }),
  ]);

  const monitors = collectMonitors(services);
  const jobs = collectJobs(monitors)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);
  const leadSummary = summarizeLeads(jobs);
  const recentLeads: LeadSummary[] = leadsPayload?.data ?? [];
  const totalLeads = leadsPayload?.pagination.total ?? 0;

  const leadBreakdown = [
    { label: "Warm", value: leadSummary.warm, style: leadTypeStyles.WARM },
    { label: "Neutral", value: leadSummary.neutral, style: leadTypeStyles.NEUTRAL },
    { label: "Cold", value: leadSummary.cold, style: leadTypeStyles.COLD },
  ];

  const metrics = [
    {
      label: "Services",
      value: services.length,
      hint: "Active ICP definitions you’re tracking.",
      icon: Layers,
    },
    {
      label: "Monitors",
      value: monitors.length,
      hint: "Listening posts across communities.",
      icon: Radar,
    },
    {
      label: "Warm leads (7d)",
      value: leadSummary.warm,
      hint: "Qualified conversations surfaced this week.",
      icon: Flame,
    },
    {
      label: "Total leads",
      value: totalLeads,
      hint: "All opportunities discovered to date.",
      icon: Users,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Workspace overview"
        description="Monitor high-signal conversations, review scheduled scrapes, and jump back into leads that need attention."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/leads">Open leads workspace</Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardStatCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2.2fr_1fr]">
        <Card className="border-border/60 bg-background/85">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border/60 text-xs uppercase tracking-wide">
                  <th className="py-2 font-semibold">Monitor</th>
                  <th className="py-2 font-semibold">Service</th>
                  <th className="py-2 font-semibold text-center">Warm</th>
                  <th className="py-2 font-semibold text-center">Neutral</th>
                  <th className="py-2 font-semibold text-center">Cold</th>
                  <th className="py-2 font-semibold text-right">Completed</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No scrape jobs yet. Create a monitor to begin tracking
                      leads.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-border/40 text-sm last:border-b-0"
                    >
                      <td className="py-3 font-medium text-foreground">
                        {job.monitorTarget}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {job.serviceName}
                      </td>
                      <td className="py-3 text-center font-semibold text-primary">
                        {job.warmLeads}
                      </td>
                      <td className="py-3 text-center text-muted-foreground">
                        {job.neutralLeads}
                      </td>
                      <td className="py-3 text-center text-muted-foreground">
                        {job.coldLeads}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {job.completedAt
                          ? formatRelative(job.completedAt)
                          : "Pending"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-border/60 bg-background/85">
            <CardHeader>
              <CardTitle>Lead breakdown</CardTitle>
              <CardDescription>
                Warmth mix across the last scrape cycles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {leadBreakdown.map((segment) => (
                <div
                  key={segment.label}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/80 px-4 py-3"
                >
                  <Badge className={segment.style}>{segment.label}</Badge>
                  <span className="text-base font-semibold text-foreground">
                    {segment.value}
                  </span>
                </div>
              ))}
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/leads">Review all leads</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/85">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Upcoming scrape windows for your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {schedule ? (
                <>
                  <div className="flex items-center justify-between rounded-2xl bg-secondary/30 px-4 py-3 text-sm text-foreground">
                    <span className="flex items-center gap-2 font-semibold">
                      <Target className="size-4 text-primary" aria-hidden />
                      Scheduled hours
                    </span>
                    <span>{formatHourList(schedule.scheduledHours)}</span>
                  </div>
                  <p className="text-xs">
                    Need more cadences? Paid plans unlock higher frequencies once
                    billing is live.
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/schedule">Adjust schedule</Link>
                  </Button>
                </>
              ) : (
                <p>
                  No schedule yet. We will create one automatically after your
                  first monitor is live.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-border/60 bg-background/85">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Recent leads</CardTitle>
              <CardDescription>
                Highlights from the latest scrape cycles.
              </CardDescription>
            </div>
            <Button variant="outline" asChild size="sm">
              <Link href="/dashboard/leads">Open leads workspace</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLeads.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-background/70 p-6 text-center text-sm text-muted-foreground">
                No leads yet. Once your monitors finish scraping, new leads will
                appear here.
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-border/60 bg-background/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge className={leadTypeStyles[lead.leadType]}>
                        {lead.leadType}
                      </Badge>
                      <Badge className={leadStatusStyles[lead.status]}>
                        {lead.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(lead.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground">
                    {lead.content}
                  </p>
                  <div className="mt-3 text-right text-xs text-muted-foreground">
                    <Link
                      className="inline-flex items-center gap-1 font-medium text-primary transition hover:text-primary/80"
                      href="/dashboard/leads"
                    >
                      <span>Manage lead</span>
                      <ListChecks className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/85">
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
            <CardDescription>Devices currently authenticated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {sessions.length === 0 ? (
              <p>No other sessions detected.</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3"
                >
                  <p className="font-medium text-foreground">
                    {session.userAgent ?? "Session"}
                  </p>
                  <p className="text-xs">
                    Expires {formatDateTime(session.expiresAt)}
                  </p>
                </div>
              ))
            )}
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/account">Manage sessions</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

const leadTypeStyles: Record<LeadType, string> = {
  WARM: "bg-primary/15 text-primary",
  NEUTRAL: "bg-secondary/40 text-foreground",
  COLD: "bg-linen/70 text-foreground",
};

const leadStatusStyles: Record<LeadStatus, string> = {
  NEW: "bg-primary/10 text-primary",
  VIEWED: "bg-secondary/40 text-foreground",
  CONTACTED: "bg-[rgba(119,51,68,0.14)] text-primary",
  ARCHIVED: "bg-muted text-muted-foreground",
};
