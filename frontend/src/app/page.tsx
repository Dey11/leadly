import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CheckCircle2,
  Compass,
  FileText,
  LineChart,
  Mail,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PricingCta } from "@/components/landing/pricing-cta";
import { getAccountSummary } from "@/lib/backend-queries";

const palette = {
  wine: "var(--wine)",
  dogwood: "var(--pale-dogwood)",
  linen: "var(--linen)",
  licorice: "var(--licorice)",
};

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const heroStats = [
  { label: "Avg. weekly qualified leads", value: "28" },
  { label: "Lift in positive replies", value: "3.2×" },
  { label: "Hours saved per rep", value: "6.5" },
];

const proofPoints = [
  {
    icon: Target,
    title: "Monitors tailored to your ICP",
    body: "Point Leadly at the exact subreddits and topics your buyers trust so you only see high-intent conversations.",
  },
  {
    icon: LineChart,
    title: "Clear scoring & trendlines",
    body: "Heat scores, momentum, and post history reveal which threads to jump in on first.",
  },
  {
    icon: Mail,
    title: "Outreach ready drafts",
    body: "AI summaries and suggested openers help your reps reply with context while competitors are still scrolling.",
  },
];

const features = [
  {
    title: "Intent signals without the busywork",
    description:
      "Leadly scans Reddit and niche communities continuously, classifies buying signals, and keeps noise out of your queue.",
    icon: BellRing,
  },
  {
    title: "AI context that lands",
    description:
      "Each lead arrives with a crisp summary, tone analysis, and recommended outreach angle so your team can personalize fast.",
    icon: Sparkles,
  },
  {
    title: "Workflow-aware cadences",
    description:
      "Scheduling guardrails ensure you stay within plan limits while covering the hours that matter most to your buyers.",
    icon: BarChart3,
  },
];

const workflowSteps = [
  {
    title: "Describe your offer",
    body: "Create a service explaining who you help, what pain you solve, and how to recognize real buying signals.",
  },
  {
    title: "Launch precision monitors",
    body: "Pick subreddits or keywords, apply filters, and let Leadly watch every new thread for qualified intent.",
  },
  {
    title: "Work the warm inbox",
    body: "Review prioritized leads, export for outreach, and track follow-up status from the same workspace.",
  },
];

const useCases = [
  {
    title: "Founders & solo GTM teams",
    description:
      "Validate messaging, find early adopters, and keep a steady flow of conversations without hiring a full SDR team.",
    takeaways: ["Daily digests", "Clear next steps", "CSV handoffs"],
  },
  {
    title: "SDR & sales pods",
    description:
      "Fill call blocks with warm community conversations and log outcomes where managers can coach.",
    takeaways: ["Lead scoring", "Status tracking", "Shared notes"],
  },
  {
    title: "Growth & marketing",
    description:
      "Spot recurring pain points, capture voice-of-customer insights, and fuel content or nurture workflows.",
    takeaways: ["Topic tagging", "Export snippets", "Campaign inspiration"],
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    cadence: "1 scrape/day · 30/mo",
    subs: "3 subreddits",
    highlights: [
      "Daily monitoring across your core communities",
      "AI summaries & heat scoring",
      "Email alerts (coming soon)",
    ],
    cta: { label: "Start free", href: "/register" },
    note: "On-demand scraping coming soon (30-minute cooldown).",
  },
  {
    name: "Pro",
    price: "$9",
    cadence: "6 scrapes/day · 180/mo",
    subs: "10 subreddits",
    highlights: [
      "Layered keyword filters & exports",
      "Priority monitoring windows",
      "Lead health dashboards + CSV downloads",
    ],
    badge: "Most popular",
    cta: { label: "Purchase now", href: "/dashboard/billing", requiresAuth: true },
    note: "Includes 10 on-demand scrapes/month (coming soon).",
  },
  {
    name: "Premium",
    price: "$24",
    cadence: "24 scrapes/day · 720/mo",
    subs: "20 subreddits",
    highlights: [
      "24×7 coverage with unlimited exports",
      "Priority support & playbooks",
      "Dedicated lead-handoff workflows",
    ],
    badge: "Scale teams",
    cta: { label: "Purchase now", href: "/dashboard/billing", requiresAuth: true },
    note: "Includes 30 on-demand scrapes/month (coming soon).",
  },
];

const testimonials = [
  {
    quote:
      "We booked 12 qualified demos in week one. Leadly surfaces buying intent long before prospects enter vendor funnels.",
    author: "Priya Sharma · Head of Growth, CalyxAI",
  },
  {
    quote:
      "Outbound finally feels strategic. Our SDRs start every morning with context-rich threads and a plan to engage.",
    author: "Marcus Allen · Founder, OpsForge",
  },
];

const faqs = [
  {
    question: "Which platforms does Leadly monitor today?",
    answer:
      "Reddit coverage is live and tuned for B2B conversations. Additional communities are on the roadmap and roll out as we validate quality.",
  },
  {
    question: "How fresh are the leads?",
    answer:
      "Leadly runs scrapes on the cadence you configure. Free includes one scrape per day, while paid tiers raise the frequency up to 24 windows.",
  },
  {
    question: "Do I need engineering support?",
    answer:
      "No engineering lift required. Describe your ICP, add monitors, and Leadly handles the rest. Exports keep RevOps and CRM workflows happy.",
  },
  {
    question: "When do paid plans launch?",
    answer:
      "Billing is opening soon. Lock in launch pricing now and enjoy the free tier until paid upgrades are available.",
  },
];

const seoTopics = [
  {
    title: "Why community-led prospecting works",
    body: "Prospects ask for help in public long before they fill out a demo form. Leadly captures those moments and gives you the context to respond with value.",
  },
  {
    title: "Signal over noise",
    body: "Keyword alerts alone miss nuance. Leadly scores sentiment, intent, and engagement so your team focuses only on conversations that drive revenue.",
  },
  {
    title: "Built for repeatable GTM",
    body: "Create a feedback loop between marketing, sales, and product by exporting insights, tagging themes, and turning community data into a growth engine.",
  },
];

function HeroLeadPreview() {
  const sampleLeads = [
    {
      channel: "r/SaaS",
      summary: "Considering community intelligence tools for CS workflows.",
      score: "Warm",
      time: "12m ago",
    },
    {
      channel: "r/Entrepreneur",
      summary: "Need a lightweight way to monitor Reddit for B2B leads.",
      score: "Neutral",
      time: "35m ago",
    },
    {
      channel: "r/Sales",
      summary: "Looking for buyer intent alerts that SDRs can action quickly.",
      score: "Warm",
      time: "1h ago",
    },
  ];

  return (
    <div className="relative max-w-lg rounded-3xl border border-border/40 bg-card/85 p-6 shadow-xl shadow-[rgba(12,0,20,0.12)] backdrop-blur">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Live pipeline
          </p>
          <p className="text-sm text-muted-foreground">
            Updated whenever your monitors scrape.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Free tier
        </span>
      </div>

      <div className="space-y-3">
        {sampleLeads.map((lead) => (
          <div
            key={lead.channel + lead.time}
            className="rounded-2xl border border-border/70 bg-background/90 px-4 py-3"
          >
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>{lead.channel}</span>
              <span>{lead.time}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {lead.summary}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 font-semibold",
                  lead.score === "Warm"
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary/40 text-foreground",
                )}
              >
                {lead.score} intent
              </span>
              <span className="text-muted-foreground">
                Suggested opener ready
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GradientBackground() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 overflow-hidden"
      style={{
        background: `radial-gradient(120% 120% at 0% 0%, ${palette.dogwood} 0%, ${palette.linen} 45%, rgba(255,255,255,0) 70%), radial-gradient(90% 90% at 100% 0%, rgba(212,77,92,0.22) 0%, rgba(255,255,255,0) 55%)`,
      }}
    />
  );
}

export default async function HomePage() {
  let account = null;
  try {
    account = await getAccountSummary();
  } catch {
    account = null;
  }
  const isAuthenticated = Boolean(account);

  const resolveCtaHref = (planHref: string, requiresAuth?: boolean) => {
    if (!requiresAuth) {
      return planHref;
    }
    return isAuthenticated
      ? planHref
      : `/login?next=${encodeURIComponent(planHref)}`;
  };
  const signInHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 z-40">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 text-sm md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-foreground"
          >
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-base font-semibold text-primary">
              L
            </span>
            Leadly
          </Link>
          <nav className="hidden items-center gap-8 font-medium text-muted-foreground md:flex">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-sm">
              <Link href={signInHref}>Sign in</Link>
            </Button>
            <Button asChild className="hidden text-sm md:inline-flex">
              <Link href="/register">
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </header>
      </div>

      <main>
        <section className="relative isolate overflow-hidden pt-28">
          <GradientBackground />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 pb-20 md:grid md:grid-cols-[1.05fr_0.95fr] md:items-center md:px-8 md:pb-28">
            <div className="space-y-8">
              <Badge className="bg-primary/10 text-primary">
                Community intent, captured
              </Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                  Turn Reddit signals into pipeline before competitors notice.
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl">
                  Leadly finds the conversations that match your ICP, scores intent,
                  and hands your team ready-to-engage threads with AI-crafted context.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Button size="lg" asChild className="sm:w-auto">
                  <Link href="/register">Create your free account</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="sm:w-auto"
                >
                  <Link href="#workflow">See the workflow</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/50 bg-card/80 p-4"
                  >
                    <p className="text-2xl font-semibold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <HeroLeadPreview />
            </div>
          </div>
        </section>

        <section className="border-y border-border/40 bg-card/70 py-12">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-6 px-5 text-sm text-muted-foreground md:px-8">
            <div className="flex items-center gap-2 font-medium text-foreground/80">
              <Users className="size-4" aria-hidden />
              Trusted by go-to-market teams testing community-led growth
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span>Arcadia Labs</span>
              <span>Northwind Ops</span>
              <span>SignalStack</span>
              <span>Brightline AI</span>
              <span>Parallel Route</span>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-20 md:px-8"
        >
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="max-w-2xl space-y-4">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Why teams choose Leadly
              </Badge>
              <h2 className="text-3xl font-semibold md:text-4xl">
                From messy threads to qualified conversations in minutes.
              </h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Leadly combines intent detection, scoring, and outreach context so
                your buyers get relevant help fast—and your reps spend their energy
                on deals that close.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {proofPoints.map((point) => (
                <Card key={point.title} className="border-border/50 bg-background/85">
                  <CardHeader className="space-y-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <point.icon className="size-5" aria-hidden />
                    </span>
                    <CardTitle className="text-lg">{point.title}</CardTitle>
                    <CardDescription>{point.body}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/70 bg-background/80 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="gap-4">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <feature.icon className="size-6" aria-hidden />
                  </span>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className="border-y border-border/40 bg-card/70 py-20"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-3">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  How it works
                </Badge>
                <h2 className="text-3xl font-semibold md:text-4xl">
                  A clear path from signal to outreach.
                </h2>
                <p className="text-base text-muted-foreground md:text-lg">
                  Launch a monitor in minutes, qualify intent automatically, and
                  keep the entire team aligned on follow-up.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-background/85 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                <Compass className="size-3.5" aria-hidden />
                Workflow
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <Card
                  key={step.title}
                  className="relative overflow-hidden border-border/60 bg-background/85"
                >
                  <span className="absolute -left-12 top-9 text-[5rem] font-bold text-[rgba(212,77,92,0.08)]">
                    {index + 1}
                  </span>
                  <CardHeader className="relative space-y-3">
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription>{step.body}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="size-4 text-primary" aria-hidden />
                    <span>Works on desktop and mobile.</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="use-cases"
          className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-20 md:px-8"
        >
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="border-primary/20 text-primary">
              Built for your GTM motion
            </Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Leadly fits the way your team sells.
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              From proving product-market fit to scaling outbound, Leadly keeps every
              stakeholder informed with the same source of truth.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="border-border/60 bg-background/85">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {useCase.takeaways.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="size-4 text-primary" aria-hidden />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border/40 bg-card/70 py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 md:grid-cols-3 md:px-8">
            {seoTopics.map((topic) => (
              <Card key={topic.title} className="border-border/60 bg-background/85">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <CardDescription>{topic.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
              Pricing
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Choose the cadence that matches your playbook
            </h2>
            <p className="text-base text-muted-foreground">
              Every plan enforces safe scraping limits while surfacing qualified leads
              from your favorite communities.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => {
              const ctaHref = resolveCtaHref(
                plan.cta.href,
                plan.cta.requiresAuth,
              );
              return (
                <Card
                  key={plan.name}
                  className={cn(
                    "flex h-full flex-col justify-between rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm",
                    plan.name === "Free"
                      ? "border-primary/40 shadow-lg shadow-primary/20"
                      : "",
                  )}
                >
                <CardHeader className="space-y-3 border-b border-border/50 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                    {plan.badge ? (
                      <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {plan.badge}
                      </Badge>
                    ) : null}
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    {plan.subs}
                  </CardDescription>
                  <div>
                    <p className="text-4xl font-semibold text-foreground">{plan.price}</p>
                    <p className="text-sm text-muted-foreground">{plan.cadence}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {plan.highlights.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="size-4 text-primary" aria-hidden />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                    <div className="space-y-2">
                      <PricingCta
                        href={ctaHref}
                        label={plan.cta.label}
                        requiresAuth={plan.cta.requiresAuth}
                        isAuthenticated={isAuthenticated}
                        targetPath={plan.cta.href}
                      />
                      <p className="text-xs text-muted-foreground">
                        {plan.note}
                      </p>
                    </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </section>

        <section className="border-y border-border/40 bg-card/70 py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 md:grid-cols-2 md:px-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.author}
                className="border-border/70 bg-background/85"
              >
                <CardContent className="space-y-4 p-6">
                  <p className="text-base leading-relaxed text-foreground/90">
                    “{testimonial.quote}”
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {testimonial.author}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="faq"
          className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-20 md:px-8"
        >
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="border-primary/30 text-primary">
              FAQ
            </Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Answers for teams evaluating Leadly
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Still curious? We&apos;re a quick email away at hello@leadly.live.
            </p>
          </div>
          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-border/60 bg-background/85 p-6 text-left"
              >
                <dt className="text-lg font-semibold text-foreground">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto w-full max-w-4xl px-5 pb-24 md:px-8">
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-border/60 bg-background/90 px-8 py-12 text-center shadow-xl shadow-[rgba(119,51,68,0.12)]">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              Ready when you are
            </span>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Turn community intent into pipeline this week.
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Create a free workspace today. We&apos;ll alert you the moment paid
              upgrades launch so you can unlock more monitors and cadences.
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">Create your free account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href="/login">I already have access</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-card/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              L
            </span>
            Leadly · leadly.live
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link className="transition hover:text-foreground" href="/login">
              Sign in
            </Link>
            <a
              className="transition hover:text-foreground"
              href="mailto:hello@leadly.live"
            >
              Contact
            </a>
            <a className="transition hover:text-foreground" href="#pricing">
              Pricing
            </a>
            <Link className="transition hover:text-foreground" href="/privacy">
              Privacy
            </Link>
            <Link className="transition hover:text-foreground" href="/terms">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
