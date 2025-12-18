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

function GradientBackground() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-background to-background blur-[100px]" />
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
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20">
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

      <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 text-sm md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-foreground transition hover:opacity-80"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-4 fill-current" />
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
            <Button asChild className="hidden text-sm md:inline-flex shadow-lg shadow-primary/25">
              <Link href="/register">
                Start free
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </header>
      </div>

      <main>
        {/* HERO SECTION */}
        <section className="relative isolate pt-16 md:pt-24 lg:pt-32 pb-20 overflow-hidden">
          <GradientBackground />
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 max-w-2xl">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-medium hover:bg-primary/20 transition-colors">
                  <Sparkles className="size-3.5 mr-2" />
                  Now with AI Intent Scoring
                </Badge>
                
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
                  Turn Reddit signals into <span className="text-primary">qualified pipeline</span>.
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Stop missing opportunities. Leadly monitors relevant communities, 
                  identifies high-intent conversations, and helps you engage before competitors do.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="h-12 px-8 text-base shadow-xl shadow-primary/20" asChild>
                    <Link href="/register">Get Started Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm" asChild>
                    <Link href="#workflow">How it Works</Link>
                  </Button>
                </div>

                <div className="pt-4 grid grid-cols-3 gap-6 border-t border-border/40">
                  {heroStats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-8 lg:mt-0">
                <div className="relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 shadow-2xl overflow-hidden group">
                  <Image
                    src="/assets/hero-dashboard.png"
                    alt="Leadly Dashboard Interface"
                    width={1200}
                    height={800}
                    priority
                    className="rounded-xl shadow-sm w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                  />
                  {/* Decorative Elements */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 blur-[60px] rounded-full pointing-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="border-y border-border/40 bg-muted/30 py-10">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-8 px-5 text-sm text-muted-foreground md:px-8">
            <span className="font-semibold text-foreground/80">Trusted by modern GTM teams</span>
            <div className="h-4 w-px bg-border/60 hidden sm:block" />
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Placeholders for logos, styled text for now */}
               <span className="font-bold text-lg">Arcadia</span>
               <span className="font-bold text-lg">Northwind</span>
               <span className="font-bold text-lg">SignalStack</span>
               <span className="font-bold text-lg">Brightline</span>
               <span className="font-bold text-lg">Parallel</span>
            </div>
          </div>
        </section>

        {/* FEATURES - ALTERNATING */}
        <section id="features" className="py-24 overflow-hidden relative">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
               <Badge variant="outline" className="border-primary/20 text-primary">Features</Badge>
               <h2 className="text-3xl md:text-5xl font-bold">Everything you need to capture intent</h2>
               <p className="text-lg text-muted-foreground">From monitoring to outreach, we've automated the busywork.</p>
            </div>

            <div className="space-y-24">
              {/* Feature 1: Monitoring */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1 relative">
                   <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-transparent rounded-[2rem] blur-xl" />
                   <Image 
                      src="/assets/feature-monitoring.png" 
                      alt="Smart Monitoring Configuration"
                      width={600}
                      height={400}
                      className="relative rounded-2xl border border-border/60 shadow-2xl bg-card"
                   />
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                  <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary">
                    <Shield className="size-6" />
                  </div>
                  <h3 className="text-3xl font-bold">Precision Monitoring, Zero Noise</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Don't waste time scrolling. Configure specific keywords and subreddits, 
                    and let Leadly filter out the noise. We only alert you when conversations 
                    match your exact Ideal Customer Profile (ICP).
                  </p>
                  <ul className="space-y-3">
                    {["Target specific subreddits", "Negative keyword filtering", "Real-time alerts"].map(item => (
                      <li key={item} className="flex items-center gap-3 text-foreground/80">
                        <CheckCircle2 className="size-5 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Feature 2: AI Intelligence */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                 <div className="space-y-6">
                  <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="size-6" />
                  </div>
                  <h3 className="text-3xl font-bold">AI That Understands Context</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Engagement matters. Our AI analyzes the sentiment and context of every post, 
                    giving you a buying intent score and suggesting the perfect angle for your reply.
                  </p>
                  <ul className="space-y-3">
                    {["Sentiment analysis", "Intent scoring (0-100)", "Draft generation"].map(item => (
                      <li key={item} className="flex items-center gap-3 text-foreground/80">
                        <CheckCircle2 className="size-5 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                 <div className="relative">
                   <div className="absolute -inset-4 bg-gradient-to-bl from-primary/10 to-transparent rounded-[2rem] blur-xl" />
                   <Image 
                      src="/assets/feature-ai.png" 
                      alt="AI Analysis"
                      width={600}
                      height={400}
                      className="relative rounded-2xl border border-border/60 shadow-2xl bg-card"
                   />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW STEPS */}
        <section id="workflow" className="py-24 bg-card/30 border-y border-border/40">
           <div className="mx-auto max-w-7xl px-5 md:px-8">
             <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
               <div className="space-y-4 max-w-2xl">
                 <h2 className="text-3xl md:text-4xl font-bold">Three steps to revenue</h2>
                 <p className="text-lg text-muted-foreground">Launch your first monitor in under 2 minutes.</p>
               </div>
               <Button variant="outline" asChild>
                 <Link href="/register">Start now <ArrowRight className="ml-2 size-4" /></Link>
               </Button>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
               {workflowSteps.map((step, i) => (
                 <Card key={i} className="bg-background/80 border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
                   <CardHeader>
                     <div className="mb-4 text-4xl font-bold text-primary/10">0{i + 1}</div>
                     <CardTitle className="text-xl">{step.title}</CardTitle>
                     <CardDescription className="text-base">{step.body}</CardDescription>
                   </CardHeader>
                 </Card>
               ))}
             </div>
           </div>
        </section>

        {/* USE CASES */}
        <section id="use-cases" className="py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold">Built for every GTM motion</h2>
             </div>
             <div className="grid md:grid-cols-3 gap-6">
               {useCases.map((useCase) => (
                 <Card key={useCase.title} className="bg-gradient-to-b from-card to-background border-border/60">
                   <CardHeader>
                     <CardTitle>{useCase.title}</CardTitle>
                     <CardDescription>{useCase.description}</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-2">
                       {useCase.takeaways.map(t => (
                         <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                           <CheckCircle2 className="size-4 text-primary" /> {t}
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
        <section id="pricing" className="py-24 bg-muted/20">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
              <p className="text-muted-foreground">Start for free, upgrade as you scale.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => {
                 const ctaHref = resolveCtaHref(plan.cta.href, plan.cta.requiresAuth);
                 return (
                  <Card key={plan.name} className={cn(
                    "relative flex flex-col h-full",
                    plan.name === "Pro" ? "border-primary shadow-xl shadow-primary/10 scale-105 z-10" : "border-border/50"
                  )}>
                    {plan.name === "Pro" && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.cadence}</p>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.highlights.map(h => (
                          <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
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
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid gap-4">
              {faqs.map((faq, i) => (
                <Card key={i} className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <CardDescription className="text-base mt-2">{faq.answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 px-5">
          <div className="mx-auto max-w-4xl bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-16 text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to find your next customers?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of sales teams who use Leadly to fill their pipeline every week.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-border/40 bg-card py-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap className="size-5 text-primary" /> Leadly
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
             <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
             <Link href="/terms" className="hover:text-foreground">Terms</Link>
             <a href="mailto:hello@leadly.live" className="hover:text-foreground">Contact</a>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Leadly Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}
