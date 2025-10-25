import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Compass,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const palette = {
  wine: "var(--wine)",
  dogwood: "var(--pale-dogwood)",
  linen: "var(--linen)",
  licorice: "var(--licorice)",
  red: "var(--indian-red)",
};

const features = [
  {
    title: "Intent signals, delivered daily",
    description:
      "Leadly monitors the subreddits and communities that mirror your ICP. You see posts the moment prospects ask for help.",
    icon: BellRing,
  },
  {
    title: "Context your reps can act on",
    description:
      "Every lead arrives with AI-powered summaries, buyer sentiment, and suggested openers to personalize outreach instantly.",
    icon: Sparkles,
  },
  {
    title: "Pipeline you can forecast",
    description:
      "Heat scores and engagement metrics stack neatly so you can prioritize warm leads, hand off cold ones, and hit quota faster.",
    icon: BarChart3,
  },
];

const steps = [
  {
    title: "Describe your offer",
    body: "Create a service in Leadly so the AI understands who you help and how to qualify real interest.",
  },
  {
    title: "Launch monitors",
    body: "Pick subreddits or keywords, set your cadence, and stay within plan limits with tier-aware guidance.",
  },
  {
    title: "Work the inbox",
    body: "Review prioritized leads, sync notes with RevOps, and reply while conversations are still fresh.",
  },
];

const testimonials = [
  {
    quote:
      "We booked 12 qualified demos in our first week. Leadly surfaces buying intent long before prospects talk to vendors.",
    author: "Priya Sharma · Head of Growth, CalyxAI",
  },
  {
    quote:
      "Outbound finally feels strategic. Our SDRs start every morning with a pipeline of warm, context-rich leads.",
    author: "Marcus Allen · Founder, OpsForge",
  },
];

const faqs = [
  {
    question: "Which platforms does Leadly monitor today?",
    answer:
      "Reddit coverage is live and optimized for B2B conversations. Twitter/X, Slack communities, and niche forums are in active development.",
  },
  {
    question: "How are leads scored?",
    answer:
      "We combine engagement signals, conversation metadata, and your service description to classify leads as warm, neutral, or cold.",
  },
  {
    question: "Do I need engineering resources to deploy Leadly?",
    answer:
      "No. GTM teams can launch services and monitors in minutes. API access and playbooks unlock on paid tiers once billing goes live.",
  },
];

const stats = [
  { label: "Lift in reply rate", value: "3.2×" },
  { label: "Hours saved per rep", value: "6.5" },
  { label: "Avg. weekly qualified leads", value: "28" },
];

function HeroLeadPreview() {
  const sampleLeads = [
    {
      channel: "r/SaaS",
      summary: "Looking for workflow automation tool for CS team",
      score: "Warm",
      time: "12m ago",
    },
    {
      channel: "r/Entrepreneur",
      summary: "Need recommendation: B2B email enrichment under $300/mo",
      score: "Neutral",
      time: "35m ago",
    },
    {
      channel: "r/Sales",
      summary: "Hiring SDR; want plug-and-play community insights",
      score: "Warm",
      time: "1h ago",
    },
  ];

  return (
    <div className="relative max-w-lg rounded-3xl border border-border/40 bg-card/80 p-6 shadow-xl shadow-[rgba(12,0,20,0.12)] backdrop-blur">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Live pipeline
          </p>
          <p className="text-sm text-muted-foreground">
            Updated each time your monitors scrape
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
                    : "bg-secondary/40 text-foreground"
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
        background: `radial-gradient(120% 120% at 0% 0%, ${palette.dogwood} 0%, ${palette.linen} 45%, rgba(255,255,255,0) 70%), radial-gradient(90% 90% at 100% 0%, rgba(212,77,92,0.25) 0%, rgba(255,255,255,0) 55%)`,
      }}
    />
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative z-50 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-foreground"
          >
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-base font-semibold text-primary">
              L
            </span>
            Leadly
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a className="transition hover:text-foreground" href="#features">
              Features
            </a>
            <a className="transition hover:text-foreground" href="#process">
              Workflow
            </a>
            <a className="transition hover:text-foreground" href="#pricing">
              Pricing
            </a>
            <a className="transition hover:text-foreground" href="#faq">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="hidden text-sm md:inline-flex">
              <Link href="/register">
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <GradientBackground />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-5 py-20 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-8 md:py-28">
            <div className="space-y-8 text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(119,51,68,0.12)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Community intelligence
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                  Turn Reddit and niche communities into a predictable deal
                  source.
                </h1>
                <p className="text-lg text-muted-foreground">
                  Leadly watches the conversations your prospects trust,
                  qualifies intent with AI, and delivers ready-to-act leads to
                  your team before competitors even notice.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Button size="lg" asChild className="sm:w-auto">
                  <Link href="/register">Launch a free workspace</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="sm:w-auto">
                  <Link href="#features">See how Leadly works</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/40 bg-card/80 p-4 text-left"
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
            <div className="flex items-center justify-center md:justify-end">
              <HeroLeadPreview />
            </div>
          </div>
        </section>

        <section className="border-y border-border/40 bg-card/70 py-16">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-6 px-5 md:px-8">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="size-4" aria-hidden />
              Trusted by GTM teams shipping community-led growth
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>Arcadia Labs</span>
              <span>Northwind Ops</span>
              <span>SignalStack</span>
              <span>Brightline AI</span>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-20 md:px-8"
        >
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Everything you need to convert community chatter into pipeline.
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Leadly combines monitoring, scoring, and workflow automation so
              outbound never misses a moment of intent.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/70 bg-background/80">
                <CardHeader className="gap-4">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[rgba(119,51,68,0.12)] text-primary">
                    <feature.icon className="size-6" aria-hidden="true" />
                  </span>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="process"
          className="border-y border-border/40 bg-card/70 py-20"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-3">
                <h2 className="text-3xl font-semibold md:text-4xl">
                  A clean path from signal to outreach.
                </h2>
                <p className="text-base text-muted-foreground md:text-lg">
                  Leadly plugs into your team in three steps. No engineering
                  tickets, no brittle scripts.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                <Compass className="size-3.5" aria-hidden />
                Workflow
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <Card
                  key={step.title}
                  className="relative overflow-hidden border-border/60 bg-background/80"
                >
                  <span className="absolute -left-12 top-8 text-[5rem] font-bold text-[rgba(212,77,92,0.08)]">
                    {index + 1}
                  </span>
                  <CardHeader className="relative space-y-2">
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription>{step.body}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-20 md:px-8"
        >
          <div className="max-w-3xl space-y-3">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Start on the Free tier. Upgrade when billing opens.
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Every workspace begins on Free—perfect for validating Leadly with
              one service. Plus and Pro unlock more cadence control once payment
              goes live.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-primary/40 bg-background/85 shadow-lg shadow-primary/15">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>
                  Ship your first monitor and prove value with daily scrapes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="text-3xl font-semibold text-foreground">
                  $0 <span className="text-base font-medium">/ forever</span>
                </p>
                <ul className="space-y-2">
                  <li>· 1 service, 3 monitors</li>
                  <li>· 1 scheduled scrape per day</li>
                  <li>· AI summaries & heat scores</li>
                  <li>· Email alerts coming soon</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-background/70">
              <CardHeader>
                <CardTitle>
                  Plus{" "}
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    Coming soon
                  </span>
                </CardTitle>
                <CardDescription>
                  Perfect for GTM teams scaling outbound with richer cadences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="text-3xl font-semibold text-foreground">
                  $129 <span className="text-base font-medium">/ month</span>
                </p>
                <ul className="space-y-2">
                  <li>· 3 services, 6 monitors</li>
                  <li>· Up to 6 scrapes each day</li>
                  <li>· CRM and Slack sync</li>
                  <li>· Collaborative notes</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-background/70">
              <CardHeader>
                <CardTitle>
                  Pro{" "}
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    Coming soon
                  </span>
                </CardTitle>
                <CardDescription>
                  For revenue teams that need full coverage and automation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="text-3xl font-semibold text-foreground">
                  $329 <span className="text-base font-medium">/ month</span>
                </p>
                <ul className="space-y-2">
                  <li>· Unlimited services, 24 monitors</li>
                  <li>· 24 scrape windows per day</li>
                  <li>· Webhooks & custom alerts</li>
                  <li>· Dedicated success partner</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-y border-border/40 bg-card/70 py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 md:grid-cols-2 md:px-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.author}
                className="border-border/70 bg-background/80"
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
            <h2 className="text-3xl font-semibold md:text-4xl">
              Frequently asked questions
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Everything you need to know about deploying Leadly for your team.
            </p>
          </div>
          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-border/60 bg-background/80 p-6"
              >
                <dt className="text-lg font-semibold text-foreground">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-sm text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto w-full max-w-4xl px-5 pb-24 md:px-8">
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-border/50 bg-background/85 px-8 py-12 text-center shadow-xl shadow-[rgba(119,51,68,0.12)]">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              Ready when you are
            </span>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Turn community intent into pipeline within a single sprint.
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Create a free workspace now. We&apos;ll notify you as soon as
              billing goes live so you can unlock more monitors and automations.
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">Create your free account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
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

