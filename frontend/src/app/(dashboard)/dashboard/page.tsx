import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    }))
  );
}

function collectJobs(monitors: MonitorWithService[]): JobWithContext[] {
  return monitors.flatMap((monitor) =>
    monitor.scrapeJobs.map((job) => ({
      ...job,
      serviceName: monitor.service?.name ?? monitor.serviceName ?? "Service",
      monitorTarget: monitor.target,
    }))
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
    { warm: 0, cold: 0, neutral: 0 }
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
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);
  const leadSummary = summarizeLeads(jobs);
  const recentLeads: LeadSummary[] = leadsPayload?.data ?? [];
  const totalLeads = leadsPayload?.pagination.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Total services</CardTitle>
            <CardDescription>Workflows you are tracking</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-foreground">
            {services.length}
          </CardContent>
        </Card>
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Total monitors</CardTitle>
            <CardDescription>Active listening posts</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-foreground">
            {monitors.length}
          </CardContent>
        </Card>
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Warm leads this week</CardTitle>
            <CardDescription>Across your latest scrapes</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-foreground">
            {leadSummary.warm}
          </CardContent>
        </Card>
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
            <CardDescription>Signed-in devices</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-foreground">
            {sessions.length}
          </CardContent>
        </Card>
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Total leads</CardTitle>
            <CardDescription>All opportunities identified to date</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-foreground">
            {totalLeads}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="bg-background/80">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Recent scrape activity</CardTitle>
              <CardDescription>
                Monitor performance from your latest jobs.
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/monitors">Manage monitors</Link>
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border/60 text-xs uppercase tracking-wide">
                  <th className="py-2 font-semibold">Monitor</th>
                  <th className="py-2 font-semibold">Service</th>
                  <th className="py-2 font-semibold">Status</th>
                  <th className="py-2 font-semibold text-center">Warm</th>
                  <th className="py-2 font-semibold text-center">Cold</th>
                  <th className="py-2 font-semibold text-center">Neutral</th>
                  <th className="py-2 font-semibold text-right">Completed</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No scrape jobs yet. Create a service and monitor to begin
                      tracking leads.
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
                      <td className="py-3 text-muted-foreground">
                        {job.status}
                      </td>
                      <td className="py-3 text-center font-semibold text-primary">
                        {job.warmLeads}
                      </td>
                      <td className="py-3 text-center text-muted-foreground">
                        {job.coldLeads}
                      </td>
                      <td className="py-3 text-center text-muted-foreground">
                        {job.neutralLeads}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {job.completedAt
                          ? `${formatRelative(job.completedAt)}`
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
          <Card className="bg-background/80">
            <CardHeader className="gap-2">
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Upcoming scrape windows for your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {schedule ? (
                <>
                  <p>
                    <span className="font-medium text-foreground">
                      Scheduled hours:
                    </span>{" "}
                    {formatHourList(schedule.scheduledHours)}
                  </p>
                  <p className="text-xs">
                    Need additional cadences? Upgrade paths launch soon — the UI
                    is ready for a billing provider when it is connected.
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/schedule">Edit schedule</Link>
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

          <Card className="bg-background/80">
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
                    className="rounded-2xl border border-border/60 bg-secondary/30 p-3"
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
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent leads</h2>
            <p className="text-sm text-muted-foreground">
              Highlights from the latest scrape cycles. Jump into the leads
              workspace to manage outreach.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/leads">Open leads workspace</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-4">
          {recentLeads.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
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
                    className="font-medium text-primary transition hover:text-primary/80"
                    href="/dashboard/leads"
                  >
                    Manage lead →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
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
