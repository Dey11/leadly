import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
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
  Zap,
  Shield,
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

export const metadata: Metadata = {
  title: "Leadly | Turn Reddit Conversations into Revenue",
  description:
    "The AI-powered lead generation platform for Reddit. Monitor communities, score buying intent, and draft personalized outreach in seconds.",
  openGraph: {
    title: "Leadly | Turn Reddit Conversations into Revenue",
    description:
      "The AI-powered lead generation platform for Reddit. Monitor communities, score buying intent, and draft personalized outreach in seconds.",
    images: ["/assets/hero-dashboard.png"],
  },
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
    cta: {
      label: "Purchase now",
      href: "/dashboard/billing",
      requiresAuth: true,
    },
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
    cta: {
      label: "Purchase now",
      href: "/dashboard/billing",
      requiresAuth: true,
    },
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

function GradientBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div className="from-primary/15 via-background to-background absolute -top-[20%] left-1/2 h-[600px] w-[80%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] blur-[100px]" />
    </div>
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
    <div className="bg-background text-foreground selection:bg-primary/20 relative min-h-screen">
      {/* Structure Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Leadly",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "AI-powered Reddit lead generation and monitoring tool for B2B sales teams.",
          }),
        }}
      />

      <div className="border-border/40 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 text-sm md:px-8">
          <Link
            href="/"
            className="text-foreground flex items-center gap-2 text-lg font-semibold transition hover:opacity-80"
          >
            <span className="relative mr-1 size-8">
              <Image
                src="/assets/logo-mark.png"
                alt="Leadly"
                fill
                className="object-contain"
              />
            </span>
            Leadly
          </Link>
          <nav className="text-muted-foreground hidden items-center gap-8 font-medium md:flex">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-foreground transition"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-sm">
              <Link href={signInHref}>Sign in</Link>
            </Button>
            <Button
              asChild
              className="shadow-primary/25 hidden text-sm shadow-lg md:inline-flex"
            >
              <Link href="/register">
                Start free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </header>
      </div>

      <main>
        {/* HERO SECTION */}
        <section className="relative isolate overflow-hidden pt-16 pb-20 md:pt-24 lg:pt-32">
          <GradientBackground />
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="max-w-2xl space-y-8">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1 text-sm font-medium transition-colors">
                  <Sparkles className="mr-2 size-3.5" />
                  Monitor Reddit for B2B Leads
                </Badge>

                <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-6xl">
                  Turn Reddit signals into{" "}
                  <span className="text-primary">qualified pipeline</span>.
                </h1>

                <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
                  Stop missing opportunities. Leadly monitors relevant
                  communities, identifies high-intent conversations, and helps
                  you engage before competitors do.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    className="shadow-primary/20 h-12 px-8 text-base shadow-xl"
                    asChild
                  >
                    <Link href="/register">Get Started Free</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-background/50 h-12 px-8 text-base backdrop-blur-sm"
                    asChild
                  >
                    <Link href="#workflow">How it Works</Link>
                  </Button>
                </div>

                <div className="border-border/40 grid grid-cols-3 gap-6 border-t pt-4">
                  {heroStats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-foreground text-2xl font-bold">
                        {stat.value}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-8 lg:mt-0">
                <div className="border-border/40 bg-card/50 group relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-sm">
                  <Image
                    src="/assets/hero-dashboard.png"
                    alt="Turn conversations into revenue"
                    width={800}
                    height={800}
                    priority
                    className="h-auto w-full object-contain p-8"
                  />
                  {/* Decorative Elements */}
                  <div className="bg-primary/20 pointing-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full blur-[60px]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="border-border/40 bg-muted/30 border-y py-10">
          <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-8 px-5 text-sm md:px-8">
            <span className="text-foreground/80 font-semibold">
              Trusted by modern GTM teams
            </span>
            <div className="bg-border/60 hidden h-4 w-px sm:block" />
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-75 grayscale transition-all duration-500 hover:grayscale-0">
              {/* Placeholders for logos, styled text for now */}
              <span className="text-lg font-bold">Arcadia</span>
              <span className="text-lg font-bold">Northwind</span>
              <span className="text-lg font-bold">SignalStack</span>
              <span className="text-lg font-bold">Brightline</span>
              <span className="text-lg font-bold">Parallel</span>
            </div>
          </div>
        </section>

        {/* FEATURES - ALTERNATING */}
        <section id="features" className="relative overflow-hidden py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mx-auto mb-20 max-w-3xl space-y-4 text-center">
              <Badge
                variant="outline"
                className="border-primary/20 text-primary"
              >
                Features
              </Badge>
              <h2 className="text-3xl font-bold md:text-5xl">
                Everything you need to capture intent
              </h2>
              <p className="text-muted-foreground text-lg">
                From monitoring to outreach, we've automated the busywork.
              </p>
            </div>

            <div className="space-y-24">
              {/* Feature 1: Monitoring */}
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div className="relative order-2 lg:order-1">
                  <div className="from-primary/10 absolute -inset-4 rounded-4xl bg-linear-to-tr to-transparent blur-xl" />
                  <Image
                    src="/assets/feature-monitoring.png"
                    alt="Smart Monitoring Configuration"
                    width={600}
                    height={400}
                    className="border-border/60 bg-card relative rounded-2xl border object-contain p-6 shadow-2xl"
                  />
                </div>
                <div className="order-1 space-y-6 lg:order-2">
                  <div className="bg-primary/10 text-primary inline-flex size-12 items-center justify-center rounded-xl">
                    <Shield className="size-6" />
                  </div>
                  <h3 className="text-3xl font-bold">
                    Precision Monitoring, Zero Noise
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Don't waste time scrolling. Configure specific keywords and
                    subreddits, and let Leadly filter out the noise. We only
                    alert you when conversations match your exact Ideal Customer
                    Profile (ICP).
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Target specific subreddits",
                      "Negative keyword filtering",
                      "Real-time alerts",
                    ].map((item) => (
                      <li
                        key={item}
                        className="text-foreground/80 flex items-center gap-3"
                      >
                        <CheckCircle2 className="text-primary size-5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Feature 2: AI Intelligence */}
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div className="space-y-6">
                  <div className="bg-primary/10 text-primary inline-flex size-12 items-center justify-center rounded-xl">
                    <Sparkles className="size-6" />
                  </div>
                  <h3 className="text-3xl font-bold">
                    AI That Understands Context
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Engagement matters. Our AI analyzes the sentiment and
                    context of every post, giving you a buying intent score and
                    suggesting the perfect angle for your reply.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Sentiment analysis",
                      "Relevance filtering",
                      "Contextual summaries",
                    ].map((item) => (
                      <li
                        key={item}
                        className="text-foreground/80 flex items-center gap-3"
                      >
                        <CheckCircle2 className="text-primary size-5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="from-primary/10 absolute -inset-4 rounded-4xl bg-linear-to-bl to-transparent blur-xl" />
                  <Image
                    src="/assets/feature-ai.png"
                    alt="AI Analysis"
                    width={600}
                    height={400}
                    className="border-border/60 bg-card relative rounded-2xl border object-contain p-6 shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW STEPS */}
        <section
          id="workflow"
          className="bg-card/30 border-border/40 border-y py-24"
        >
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
              <div className="max-w-2xl space-y-4">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Three steps to revenue
                </h2>
                <p className="text-muted-foreground text-lg">
                  Launch your first monitor in under 2 minutes.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/register">
                  Start now <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {workflowSteps.map((step, i) => (
                <Card
                  key={i}
                  className="bg-background/80 border-border/50 hover:border-primary/30 transition-all hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="text-primary/10 mb-4 text-4xl font-bold">
                      0{i + 1}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription className="text-base">
                      {step.body}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section id="use-cases" className="py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold">Built for every GTM motion</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {useCases.map((useCase) => (
                <Card
                  key={useCase.title}
                  className="from-card to-background border-border/60 bg-linear-to-b"
                >
                  <CardHeader>
                    <CardTitle>{useCase.title}</CardTitle>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {useCase.takeaways.map((t) => (
                        <div
                          key={t}
                          className="text-muted-foreground flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="text-primary size-4" /> {t}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="bg-muted/20 py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-16 space-y-4 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="text-muted-foreground">
                Start for free, upgrade as you scale.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              {pricingPlans.map((plan) => {
                const ctaHref = resolveCtaHref(
                  plan.cta.href,
                  plan.cta.requiresAuth,
                );
                return (
                  <Card
                    key={plan.name}
                    className={cn(
                      "relative flex h-full flex-col",
                      plan.name === "Pro"
                        ? "border-primary shadow-primary/10 z-10 scale-105 shadow-xl"
                        : "border-border/50",
                    )}
                  >
                    {plan.name === "Pro" && (
                      <div className="bg-primary text-primary-foreground absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold">
                        MOST POPULAR
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {plan.cadence}
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <ul className="mb-8 flex-1 space-y-3">
                        {plan.highlights.map((h) => (
                          <li
                            key={h}
                            className="text-muted-foreground flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                      <PricingCta
                        href={ctaHref}
                        label={plan.cta.label}
                        requiresAuth={plan.cta.requiresAuth}
                        isAuthenticated={isAuthenticated}
                        targetPath={plan.cta.href}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24">
          <div className="mx-auto max-w-4xl px-5 md:px-8">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-4">
              {faqs.map((faq, i) => (
                <Card key={i} className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {faq.answer}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-5 py-24">
          <div className="bg-primary/5 border-primary/20 mx-auto max-w-4xl space-y-6 rounded-3xl border p-8 text-center md:p-16">
            <h2 className="text-3xl font-bold md:text-5xl">
              Ready to find your next customers?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Join hundreds of sales teams who use Leadly to fill their pipeline
              every week.
            </p>
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/register">Start For Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border/40 bg-card border-t py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 md:flex-row md:px-8">
          <div className="flex items-center gap-2 text-lg font-bold">
            <Image
              src="/assets/logo-mark.png"
              alt="Leadly"
              width={24}
              height={24}
            />
            Leadly
          </div>
          <div className="text-muted-foreground flex gap-8 text-sm">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <a
              href="mailto:hello@leadly.live"
              className="hover:text-foreground"
            >
              Contact
            </a>
          </div>
          <div className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Leadly Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}
