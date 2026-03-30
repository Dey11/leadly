"use client";

import { motion } from "motion/react";
import { Brain, Target, Zap, Check, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const comparisonData = [
  {
    feature: "Detection Method",
    leadly: "AI understands intent & context",
    others: "Simple keyword matching",
    leadlyHas: true,
    othersHas: false,
  },
  {
    feature: "False Positives",
    leadly: "Low — AI filters noise",
    others: "High — every mention triggers",
    leadlyHas: true,
    othersHas: false,
  },
  {
    feature: "Relevance Scoring",
    leadly: "AI scores leads 0-100%",
    others: "Manual review required",
    leadlyHas: true,
    othersHas: false,
  },
  {
    feature: "Sentiment Analysis",
    leadly: "Built-in, real-time",
    others: "Not available",
    leadlyHas: true,
    othersHas: false,
  },
  {
    feature: "Setup Time",
    leadly: "Minutes — just pick subreddits",
    others: "Hours of keyword research",
    leadlyHas: true,
    othersHas: false,
  },
  {
    feature: "Keyword Tracking",
    leadly: "AI-enhanced keyword monitoring",
    others: "Basic matching only",
    leadlyHas: true,
    othersHas: true,
  },
  {
    feature: "Email Notifications",
    leadly: "In-app lead queue and dashboards",
    others: "Alerts only",
    leadlyHas: true,
    othersHas: true,
  },
  {
    feature: "Outreach Generator",
    leadly: "Reply planning built around context",
    others: "Usually manual",
    leadlyHas: true,
    othersHas: true,
  },
];

const advantages = [
  {
    icon: Brain,
    title: "Built around intent, not just mentions",
    description:
      "Leadly is designed to help SaaS founders and agencies focus on recommendation threads, alternative searches, and urgent problem statements.",
  },
  {
    icon: Target,
    title: "A cleaner action queue",
    description:
      "You should not need to read fifty noisy alerts to find one real opportunity. Leadly is strongest when quality matters more than volume.",
  },
  {
    icon: Zap,
    title: "Founder-speed setup",
    description:
      "Pick the communities and categories you care about, then start monitoring with a workflow that makes sense for lean teams.",
  },
];

export function Competitors() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-4xl text-center sm:mb-14 lg:mb-16"
        >
          <h2 className="font-display text-foreground mb-4 text-3xl font-bold tracking-tight sm:mb-6 sm:text-4xl md:text-5xl">
            Compare Leadly with generic monitoring tools
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-base leading-relaxed sm:text-lg">
            Most Reddit tools stop at alerts. Leadly is designed for teams that
            need signal quality, commercial context, and a faster path from
            thread to pipeline.
          </p>
        </motion.div>

        {/* Comparison - Pixelmatters Style (Theme Aware) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mb-16 max-w-5xl sm:mb-20 lg:mb-60"
        >
          {/* Two-section layout grid */}
          <div className="grid items-start gap-0 md:grid-cols-[1.5fr_1.8fr]">
            {/* Left section - Features & Traditional */}
            <div className="hidden pt-8 pr-8 md:block">
              {/* Header row */}
              <div className="flex items-center justify-between px-4 pb-6">
                <span className="text-foreground/60 text-xs font-bold tracking-widest uppercase">
                  Features
                </span>
                <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                  Traditional Tools
                </span>
              </div>

              {/* Data Rows */}
              {comparisonData.map((row, i) => (
                <div
                  key={`trad-${row.feature}`}
                  className={`grid grid-cols-[1fr_1fr] px-4 py-4 ${
                    i !== comparisonData.length - 1
                      ? "border-border/40 border-b"
                      : ""
                  }`}
                >
                  <span className="text-foreground/80 pr-4 text-sm font-semibold">
                    {row.feature}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {row.others}
                  </span>
                </div>
              ))}
            </div>

            {/* Right section - Leadly (Popped out card) */}
            <div className="relative">
              <div className="border-primary/20 bg-card shadow-primary/10 relative z-10 overflow-hidden rounded-2xl border shadow-2xl sm:rounded-3xl md:-my-6 dark:bg-[#1a0f12]">
                {/* Header with logo */}
                <div className="border-primary/10 bg-primary/5 dark:bg-primary/10 flex items-center justify-center border-b px-6 py-6 sm:px-8">
                  <Image
                    src="/assets/logo.svg"
                    alt="Leadly"
                    width={120}
                    height={32}
                    loading="lazy"
                    className="h-8 w-auto dark:hidden"
                  />
                  <Image
                    src="/assets/logo-dark.svg"
                    alt="Leadly"
                    width={120}
                    height={32}
                    loading="lazy"
                    className="hidden h-8 w-auto dark:block"
                  />
                </div>

                {/* Rows */}
                {comparisonData.map((row, i) => (
                  <div
                    key={`leadly-${row.feature}`}
                    className={`bg-card flex items-center gap-4 px-6 py-4 sm:px-8 dark:bg-[#1a0f12] ${
                      i !== comparisonData.length - 1
                        ? "border-primary/5 border-b dark:border-white/5"
                        : ""
                    }`}
                  >
                    {/* Checkmark */}
                    {row.leadlyHas === true ? (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 shadow-sm">
                        <Check
                          className="h-3.5 w-3.5 text-white"
                          strokeWidth={3}
                        />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 shadow-sm">
                        <X className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Feature label for mobile only */}
                    <div className="flex flex-col md:hidden">
                      <span className="text-foreground/50 mb-0.5 text-xs tracking-wide uppercase">
                        {row.feature}
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        {row.leadly}
                      </span>
                    </div>

                    {/* Desktop text */}
                    <span className="text-foreground hidden text-sm font-medium md:block">
                      {row.leadly}
                    </span>
                  </div>
                ))}
              </div>

              {/* Decorative glow behind the card */}
              <div className="bg-primary/20 absolute inset-0 -z-10 scale-95 transform rounded-3xl opacity-50 blur-3xl dark:opacity-30" />
            </div>
          </div>
        </motion.div>

        {/* Advantage cards section */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center sm:mb-14"
          >
            <h2 className="font-display text-foreground mb-3 text-3xl font-bold tracking-tight sm:mb-4 sm:text-4xl md:text-5xl">
              Why founders and agencies move past raw alerts
            </h2>
            <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
              Leadly is for teams that want fewer false positives, better
              timing, and a workflow that makes Reddit demand easier to act on.
            </p>
          </motion.div>

          <div className="mb-10 flex flex-wrap justify-center gap-3">
            <Button variant="outline" asChild className="rounded-full px-6">
              <Link href="/compare/leadly-vs-syften">Leadly vs Syften</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full px-6">
              <Link href="/compare/leadly-vs-f5bot">Leadly vs F5Bot</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full px-6">
              <Link href="/compare/leadly-vs-gummysearch">
                Leadly vs GummySearch
              </Link>
            </Button>
          </div>

          {/* Video Embed */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border-border/60 mx-auto mb-8 max-w-5xl overflow-hidden rounded-2xl border shadow-2xl sm:rounded-3xl"
          >
            <div className="relative aspect-video w-full bg-black/5 dark:bg-black/20">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=7B5qX8Z8Z8Z8Z8Z8"
                title="Leadly Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </motion.div> */}

          <div className="mx-auto grid max-w-5xl gap-4 sm:gap-6 md:grid-cols-3">
            {advantages.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + i * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                className="group border-border/40 bg-card hover:border-primary/20 relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-[#1a0f12]/50"
              >
                {/* Hover Gradient */}
                <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200 group-hover:scale-110">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-foreground mb-3 text-xl font-bold">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
