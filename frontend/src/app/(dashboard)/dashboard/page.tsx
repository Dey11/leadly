import Link from "next/link";
import {
  CalendarClock,
  Flame,
  Layers,
  ListChecks,
  Radar,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

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
  getIcps,
  getLeads,
  getSchedule,
} from "@/lib/backend-queries";
import { formatDateTime, formatHour, formatRelative } from "@/lib/format";
import type {
  Icp,
  LeadStatus,
  LeadSummary,
  LeadType,
  Monitor,
  ScrapeJob,
  Schedule,
  Session,
} from "@/types/backend";

type MonitorWithIcp = Monitor & { icpName?: string };
type JobWithContext = ScrapeJob & {
  icpName: string;
  monitorTarget: string;
};

const numberFormatter = new Intl.NumberFormat("en-US");

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

const primeTimeTargets = [10, 13, 18, 21];

function selectPrimeHours(hours: number[]) {
  if (!hours.length) return [];

  const uniqueSorted = Array.from(new Set(hours)).sort((a, b) => a - b);
  const available = [...uniqueSorted];
  const selected: number[] = [];

  for (const target of primeTimeTargets) {
    if (!available.length) break;
    let bestIndex = 0;
    let bestDiff = Number.POSITIVE_INFINITY;

    available.forEach((hour, index) => {
      const diff = Math.min(
        Math.abs(hour - target),
        Math.abs(hour + 24 - target),
        Math.abs(hour - (target + 24)),
      );
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIndex = index;
      }
    });

    selected.push(...available.splice(bestIndex, 1));
  }

  while (
    selected.length < Math.min(4, uniqueSorted.length) &&
    available.length > 0
  ) {
    selected.push(available.shift()!);
  }

  return selected.sort((a, b) => a - b);
}

function createDesignMockData(): {
  icps: Icp[];
  schedule: Schedule;
  sessions: Session[];
  leadsPayload: {
    data: LeadSummary[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
} {
  const now = Date.now();

  const makeJob = ({
    id,
    monitorId,
    warm,
    neutral,
    cold,
    hoursAgo,
    status = "COMPLETED",
  }: {
    id: string;
    monitorId: string;
    warm: number;
    neutral: number;
    cold: number;
    hoursAgo: number;
    status?: ScrapeJob["status"];
  }): ScrapeJob => {
    const createdAt = new Date(now - hoursAgo * 60 * 60 * 1000);
    const completedAt =
      status === "COMPLETED"
        ? new Date(createdAt.getTime() + 45 * 60 * 1000)
        : null;
    return {
      id,
      monitorId,
      status,
      errorMessage: null,
      metadata: null,
      warmLeads: warm,
      coldLeads: cold,
      neutralLeads: neutral,
      startedAt: createdAt.toISOString(),
      completedAt: completedAt ? completedAt.toISOString() : null,
      createdAt: createdAt.toISOString(),
      leads: [],
    };
  };

  const monitors: Monitor[] = [
    {
      id: "monitor-1",
      userId: "design-user",
      icpId: "icp-1",
      platform: "REDDIT",
      target: "r/startups",
      cursor: null,
      status: "ACTIVE",
      lastScrapedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      scrapeJobs: [
        makeJob({
          id: "job-1",
          monitorId: "monitor-1",
          warm: 12,
          neutral: 5,
          cold: 2,
          hoursAgo: 6,
        }),
        makeJob({
          id: "job-2",
          monitorId: "monitor-1",
          warm: 9,
          neutral: 4,
          cold: 3,
          hoursAgo: 30,
        }),
        makeJob({
          id: "job-3",
          monitorId: "monitor-1",
          warm: 7,
          neutral: 6,
          cold: 2,
          hoursAgo: 54,
        }),
      ],
    },
    {
      id: "monitor-2",
      userId: "design-user",
      icpId: "icp-1",
      platform: "REDDIT",
      target: "r/SaaS",
      cursor: null,
      status: "ACTIVE",
      lastScrapedAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 18 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      scrapeJobs: [
        makeJob({
          id: "job-4",
          monitorId: "monitor-2",
          warm: 7,
          neutral: 3,
          cold: 1,
          hoursAgo: 14,
        }),
        makeJob({
          id: "job-5",
          monitorId: "monitor-2",
          warm: 5,
          neutral: 6,
          cold: 2,
          hoursAgo: 40,
        }),
      ],
    },
    {
      id: "monitor-3",
      userId: "design-user",
      icpId: "icp-2",
      platform: "REDDIT",
      target: "r/marketing",
      cursor: null,
      status: "ACTIVE",
      lastScrapedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      scrapeJobs: [
        makeJob({
          id: "job-6",
          monitorId: "monitor-3",
          warm: 6,
          neutral: 4,
          cold: 1,
          hoursAgo: 10,
          status: "RUNNING",
        }),
        makeJob({
          id: "job-7",
          monitorId: "monitor-3",
          warm: 8,
          neutral: 5,
          cold: 2,
          hoursAgo: 36,
        }),
      ],
    },
    {
      id: "monitor-4",
      userId: "design-user",
      icpId: "icp-2",
      platform: "REDDIT",
      target: "r/growthhacking",
      cursor: null,
      status: "ACTIVE",
      lastScrapedAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      scrapeJobs: [
        makeJob({
          id: "job-8",
          monitorId: "monitor-4",
          warm: 4,
          neutral: 5,
          cold: 1,
          hoursAgo: 20,
        }),
        makeJob({
          id: "job-9",
          monitorId: "monitor-4",
          warm: 3,
          neutral: 6,
          cold: 2,
          hoursAgo: 68,
        }),
      ],
    },
    {
      id: "monitor-5",
      userId: "design-user",
      icpId: "icp-3",
      platform: "REDDIT",
      target: "r/healthIT",
      cursor: null,
      status: "PAUSED",
      lastScrapedAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 42 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
      scrapeJobs: [
        makeJob({
          id: "job-10",
          monitorId: "monitor-5",
          warm: 2,
          neutral: 4,
          cold: 3,
          hoursAgo: 96,
        }),
      ],
    },
  ];

  const icps: Icp[] = [
    {
      id: "icp-1",
      userId: "design-user",
      name: "Seed-stage SaaS founders",
      summary:
        "Early-stage founders building SaaS products and seeking GTM guidance.",
      targetPersona:
        "Founders and founding marketers growing ARR from 0 to 50k.",
      pains:
        "Limited bandwidth to monitor conversations, difficulty sourcing leads.",
      valueProposition:
        "Leadly surfaces high-signal conversations daily without manual effort.",
      qualifyingSignals:
        "Active Reddit or community presence, hiring growth roles, raising capital.",
      disqualifyingSignals: "Agency lead gen offers, spam-heavy communities.",
      platform: "REDDIT",
      status: "ACTIVE",
      createdAt: new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      monitors: monitors.filter((monitor) => monitor.icpId === "icp-1"),
    },
    {
      id: "icp-2",
      userId: "design-user",
      name: "Product-led growth teams",
      summary: "PLG teams focused on retention and community-led demand.",
      targetPersona:
        "Growth marketers and product managers in Series A/B companies.",
      pains: "Need to catch user feedback quickly, track competitor moves.",
      valueProposition:
        "Leadly flags conversations and requests worth prioritizing.",
      qualifyingSignals:
        "Mentions of roadmaps, pricing changes, onboarding questions.",
      disqualifyingSignals: "Communities dominated by self-promo threads.",
      platform: "REDDIT",
      status: "ACTIVE",
      createdAt: new Date(now - 48 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      monitors: monitors.filter((monitor) => monitor.icpId === "icp-2"),
    },
    {
      id: "icp-3",
      userId: "design-user",
      name: "Healthcare operations leaders",
      summary: "Ops leaders evaluating workflow platforms for care teams.",
      targetPersona: "Directors of operations and clinical informatics.",
      pains: "Hard to track compliance discussions, fragmented tooling.",
      valueProposition:
        "Leadly curates opportunities when leaders seek vendor guidance.",
      qualifyingSignals:
        "Threads mentioning patient intake, scheduling, EMR integrations.",
      disqualifyingSignals: "General patient questions without buying intent.",
      platform: "REDDIT",
      status: "PAUSED",
      createdAt: new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
      monitors: monitors.filter((monitor) => monitor.icpId === "icp-3"),
    },
  ];

  const schedule: Schedule = {
    id: "schedule-1",
    userId: "design-user",
    scheduledHours: [9, 11, 14, 19, 21, 23],
    createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
  };

  const sessions: Session[] = [
    {
      id: "session-1",
      ipAddress: "24.18.10.42",
      userAgent: "Chrome · macOS",
      expiresAt: new Date(now + 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "session-2",
      ipAddress: "66.102.7.104",
      userAgent: "Safari · iOS",
      expiresAt: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const leads: LeadSummary[] = [
    {
      id: "lead-1",
      platform: "REDDIT",
      leadType: "WARM",
      content:
        "We're looking for a way to automate outbound for our SaaS launch—anyone used Leadly for high-intent subreddit monitoring?",
      url: "https://reddit.com/r/startups/lead-1",
      author: "founder42",
      status: "NEW",
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "lead-2",
      platform: "REDDIT",
      leadType: "NEUTRAL",
      content:
        "Need recommendations for tools that aggregate community chatter into actionable briefs for growth teams.",
      url: "https://reddit.com/r/marketing/lead-2",
      author: "growthmarketer",
      status: "VIEWED",
      createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "lead-3",
      platform: "REDDIT",
      leadType: "WARM",
      content:
        "Comparing CommonRoom vs alternatives for community intelligence—interested in any scrapers that plug into Slack.",
      url: "https://reddit.com/r/growthhacking/lead-3",
      author: "plgnerd",
      status: "CONTACTED",
      createdAt: new Date(now - 11 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "lead-4",
      platform: "REDDIT",
      leadType: "COLD",
      content:
        "Any free tools to watch subreddit mentions about EMR scheduling platforms?",
      url: "https://reddit.com/r/healthIT/lead-4",
      author: "opscare",
      status: "VIEWED",
      createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "lead-5",
      platform: "REDDIT",
      leadType: "NEUTRAL",
      content:
        "Looking for advice on building an ICP for SMB healthcare—resources appreciated.",
      url: "https://reddit.com/r/startups/lead-5",
      author: "opsfounder",
      status: "NEW",
      createdAt: new Date(now - 36 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return {
    icps,
    schedule,
    sessions,
    leadsPayload: {
      data: leads,
      pagination: { total: 128, page: 1, limit: 5, totalPages: 26 },
    },
  };
}

export const metadata = {
  title: "Dashboard · Leadly",
};

export default async function DashboardHome() {
  const designMode = process.env.NEXT_PUBLIC_DESIGN_MODE === "1";

  let icps: Icp[] = [];
  let schedule: Schedule | null = null;
  let sessions: Session[] = [];
  let leadsPayload: {
    data: LeadSummary[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } | null = null;

  if (designMode) {
    const mock = createDesignMockData();
    icps = mock.icps;
    schedule = mock.schedule;
    sessions = mock.sessions;
    leadsPayload = mock.leadsPayload;
  } else {
    const [icpsResponse, scheduleResponse, sessionsResponse, leadsResponse] =
      await Promise.all([
        getIcps(),
        getSchedule(),
        getAccountSessions(),
        getLeads({ limit: 5, page: 1 }),
      ]);
    icps = icpsResponse;
    schedule = scheduleResponse;
    sessions = sessionsResponse;
    leadsPayload = leadsResponse;
  }

  const monitors = collectMonitors(icps);
  const jobs = collectJobs(monitors)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);
  const leadSummary = summarizeLeads(jobs);
  const recentLeads: LeadSummary[] = leadsPayload?.data ?? [];
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
    jobs.find((job) => job.completedAt) ?? jobs.at(0) ?? null;
  const lastCompletedLabel = lastCompletedJob?.completedAt
    ? formatRelative(lastCompletedJob.completedAt)
    : "Awaiting first completion";
  const jobVolumeLabel = lastCompletedJob
    ? `${lastCompletedJob.warmLeads} warm · ${lastCompletedJob.neutralLeads} neutral`
    : "No job volume yet.";

  const scheduledHours = schedule
    ? Array.from(new Set(schedule.scheduledHours)).sort((a, b) => a - b)
    : [];
  const primeHours = scheduledHours.length
    ? selectPrimeHours(scheduledHours)
    : [];
  const primeHoursLabel = primeHours.length
    ? primeHours.map((hour) => formatHour(hour)).join(" · ")
    : "Aim for late morning, lunchtime, and early evening scrapes.";
  const scheduleHourBadges = scheduledHours
    .slice(0, 8)
    .map((hour) => formatHour(hour));

  const latestWarmLeads = jobs[0]?.warmLeads ?? 0;
  const previousWarmLeads = jobs[1]?.warmLeads ?? 0;
  const warmDelta = latestWarmLeads - previousWarmLeads;
  const warmTrendLabel =
    jobs.length > 1
      ? `${warmDelta >= 0 ? "+" : ""}${warmDelta} vs last run`
      : "Baseline run";
  const warmTrendTone: "positive" | "negative" | "neutral" =
    warmDelta > 0 ? "positive" : warmDelta < 0 ? "negative" : "neutral";

  const newLeadsCount = recentLeads.length;
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
      hint: "Qualified conversations surfaced this week.",
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

  const spotlightCards = [
    {
      label: "Last scrape",
      icon: Radar,
      primary: lastCompletedLabel,
      secondary: jobVolumeLabel,
    },
    {
      label: "Cadence",
      icon: CalendarClock,
      primary: schedule ? primeHoursLabel : "Select scrape windows",
      secondary: schedule
        ? "Lean on these windows to catch peak community momentum."
        : "Choose hours to start automated scrapes.",
    },
    {
      label: "Coverage",
      icon: Layers,
      primary: `${activeMonitorCount} active monitors`,
      secondary:
        icps.length > 0
          ? `${icps.length} ICPs managed · ${monitors.length} monitors total`
          : "Spin up your first ICP to begin tracking.",
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <section className="border-border/60 bg-card/95 relative overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur md:p-8">
        <div className="bg-primary/15 pointer-events-none absolute top-0 -right-10 h-48 w-48 rounded-full blur-3xl" />
        <div className="flex flex-col gap-6">
          <DashboardPageHeader
            title="Workspace overview"
            description="Monitor high-signal conversations, review scheduled scrapes, and jump back into leads that need attention."
            action={
              <Button asChild>
                <Link href="/dashboard/leads">Open leads workspace</Link>
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            {spotlightCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="border-border/60 bg-background/90 rounded-2xl border p-4 shadow-sm"
                >
                  <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
                    <Icon className="text-primary size-4" aria-hidden />
                    {card.label}
                  </div>
                  <p className="text-foreground mt-2 text-sm font-semibold">
                    {card.primary}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {card.secondary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardStatCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            trendLabel={metric.trendLabel}
            trendTone={metric.trendTone}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <Card className="border-border/60 bg-card/95 overflow-hidden rounded-3xl border shadow-sm">
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
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-border/60 border-b text-xs tracking-wide uppercase">
                  <th className="py-3 pr-3 font-semibold">Monitor</th>
                  <th className="py-3 pr-3 font-semibold">ICP</th>
                  <th className="py-3 pr-3 font-semibold">Status</th>
                  <th className="py-3 pr-3 text-center font-semibold">Warm</th>
                  <th className="py-3 pr-3 text-center font-semibold">
                    Neutral
                  </th>
                  <th className="py-3 pr-3 text-center font-semibold">Cold</th>
                  <th className="py-3 text-right font-semibold">Completed</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-muted-foreground py-12 text-center text-sm"
                    >
                      No scrape jobs yet. Create a monitor to begin tracking
                      leads.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-border/40 border-b text-sm last:border-b-0"
                    >
                      <td className="text-foreground py-4 pr-3 font-medium">
                        {job.monitorTarget}
                      </td>
                      <td className="text-muted-foreground py-4 pr-3">
                        {job.icpName}
                      </td>
                      <td className="py-4 pr-3">
                        <Badge className={jobStatusStyles[job.status]}>
                          {job.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="text-primary py-4 pr-3 text-center font-semibold">
                        {job.warmLeads}
                      </td>
                      <td className="text-muted-foreground py-4 pr-3 text-center">
                        {job.neutralLeads}
                      </td>
                      <td className="text-muted-foreground py-4 pr-3 text-center">
                        {job.coldLeads}
                      </td>
                      <td className="text-muted-foreground py-4 text-right">
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
                    className={`${leadProgressStyles[segment.type]} h-full`}
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
                        className={`${leadDotStyles[segment.type]} size-2.5 rounded-full`}
                        aria-hidden
                      />
                      <Badge className={leadTypeStyles[segment.type]}>
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

          <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Upcoming scrape windows for your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4 text-sm">
              {schedule ? (
                <>
                  <div className="border-primary/20 bg-primary/10 text-primary rounded-2xl border p-4 text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      <Target className="size-4" aria-hidden />
                      Prime hours
                    </div>
                    <p className="text-primary/80 mt-1 text-xs">
                      {primeHours.length
                        ? primeHoursLabel
                        : "Dial in a handful of windows to maximise Reddit visibility."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scheduleHourBadges.length > 0 ? (
                      scheduleHourBadges.map((hour) => (
                        <Badge
                          key={hour}
                          variant="outline"
                          className="border-border/70 bg-background/95 text-foreground rounded-full text-xs"
                        >
                          {hour}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs">
                        No hours selected yet. Add monitoring windows to begin
                        scraping.
                      </span>
                    )}
                    {schedule &&
                    scheduledHours.length > scheduleHourBadges.length ? (
                      <Badge
                        variant="outline"
                        className="border-border/70 bg-background/95 text-foreground rounded-full text-xs"
                      >
                        +{scheduledHours.length - scheduleHourBadges.length}{" "}
                        more
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs">
                    Need more cadences? Paid plans unlock higher frequencies
                    once billing is live.
                  </p>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Link href="/dashboard/schedule">Adjust schedule</Link>
                  </Button>
                </>
              ) : (
                <div className="border-border/60 bg-background/85 rounded-2xl border p-4 text-sm">
                  No schedule yet. We will create one automatically after your
                  first monitor is live.
                </div>
              )}
            </CardContent>
          </Card>
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
            {recentLeads.length === 0 ? (
              <div className="border-border/60 bg-background/80 text-muted-foreground rounded-2xl border p-6 text-center text-sm">
                No leads yet. Once your monitors finish scraping, new leads will
                appear here.
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="border-border/60 bg-background/85 rounded-2xl border p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`${leadDotStyles[lead.leadType]} size-2.5 rounded-full`}
                        aria-hidden
                      />
                      <Badge className={leadTypeStyles[lead.leadType]}>
                        {lead.leadType}
                      </Badge>
                      <Badge className={leadStatusStyles[lead.status]}>
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
                    <span className="inline-flex items-center gap-1">
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

const leadTypeStyles: Record<LeadType, string> = {
  WARM: "border border-primary/30 bg-primary/12 text-primary",
  NEUTRAL: "border border-secondary/40 bg-secondary/40 text-foreground",
  COLD: "border border-muted/60 bg-muted text-muted-foreground",
};

const leadStatusStyles: Record<LeadStatus, string> = {
  NEW: "border border-primary/30 bg-primary/12 text-primary",
  VIEWED: "border border-secondary/40 bg-secondary/30 text-foreground",
  CONTACTED:
    "border border-[rgba(119,51,68,0.25)] bg-[rgba(119,51,68,0.12)] text-primary",
  ARCHIVED: "border border-muted/60 bg-muted text-muted-foreground",
};

const leadProgressStyles: Record<LeadType, string> = {
  WARM: "bg-primary",
  NEUTRAL: "bg-secondary-foreground/70",
  COLD: "bg-muted-foreground/70",
};

const leadDotStyles: Record<LeadType, string> = {
  WARM: "bg-primary",
  NEUTRAL: "bg-secondary-foreground/70",
  COLD: "bg-muted-foreground/70",
};

const jobStatusStyles: Record<ScrapeJob["status"], string> = {
  COMPLETED: "border border-primary/30 bg-primary/12 text-primary",
  RUNNING: "border border-secondary/40 bg-secondary/35 text-foreground",
  PENDING: "border border-muted/60 bg-muted text-muted-foreground",
  FAILED:
    "border border-[rgba(187,47,66,0.2)] bg-[rgba(187,47,66,0.1)] text-[#bb2f42]",
};
