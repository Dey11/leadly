"use client";

import { motion } from "motion/react";
import { Brain, Target, Zap, TrendingUp, Check, X, Clock } from "lucide-react";

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
    leadly: "Low — AI filters noise automatically",
    others: "High — every mention triggers alerts",
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
    leadly: "Coming soon (AI-enhanced)",
    others: "Basic keyword matching only",
    leadlyHas: "soon",
    othersHas: true,
  },
];

const advantages = [
  {
    icon: Brain,
    title: "AI That Actually Understands",
    description:
      "Other tools ping you for every keyword mention. Leadly pings you when someone is actually ready to buy.",
  },
  {
    icon: Target,
    title: "Intent Over Keywords",
    description:
      "We understand why someone is asking, not just what they're typing. That means fewer false positives, more conversions.",
  },
  {
    icon: Zap,
    title: "Zero Configuration",
    description:
      "No need to brainstorm keyword lists. Just tell us your product and pick your subreddits. Our AI does the rest.",
  },
];

export function Competitors() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="from-primary/[0.02] to-accent/[0.02] absolute inset-0 bg-gradient-to-br via-transparent" />
      </div>

      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14 lg:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="from-primary/10 to-accent/10 border-primary/20 text-primary mb-4 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-3 py-1.5 text-xs font-medium sm:mb-6 sm:px-4 sm:py-2 sm:text-sm"
          >
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            Why We're Different
          </motion.div>
          <h2 className="text-foreground font-display mb-4 text-3xl font-bold tracking-tight sm:mb-6 sm:text-4xl md:text-5xl">
            Not just another{" "}
            <span className="relative inline-block">
              <span className="relative z-10">keyword tracker</span>
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
                className="bg-primary/15 absolute bottom-1 left-0 -z-10 h-2 w-full origin-left sm:bottom-2 sm:h-3"
              />
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            Traditional tools rely on keyword matching — great for catching
            every mention, terrible for your sanity. Leadly uses AI to find
            people who are{" "}
            <span className="highlight-word">actually buying</span>.
          </p>
        </motion.div>

        {/* Redesigned Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mb-16 max-w-4xl sm:mb-20 lg:mb-28"
        >
          <div className="bg-card border-border/50 overflow-hidden rounded-xl border shadow-lg sm:rounded-2xl">
            {/* Table header */}
            <div className="border-border/40 bg-muted/30 grid grid-cols-[1.2fr_1fr_1fr] items-center gap-2 border-b px-4 py-4 sm:grid-cols-[1.5fr_1fr_1fr] sm:gap-4 sm:px-6 sm:py-5">
              <div className="text-foreground text-xs font-semibold tracking-wide uppercase sm:text-sm">
                Feature
              </div>
              <div className="text-center">
                <span className="text-primary text-xs font-bold sm:text-sm">
                  Leadly
                </span>
              </div>
              <div className="text-muted-foreground text-center text-xs font-semibold sm:text-sm">
                Others
              </div>
            </div>

            {/* Table rows */}
            {comparisonData.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1.2fr_1fr_1fr] items-center gap-2 px-4 py-3 transition-colors duration-150 sm:grid-cols-[1.5fr_1fr_1fr] sm:gap-4 sm:px-6 sm:py-4 ${
                  i !== comparisonData.length - 1
                    ? "border-border/30 border-b"
                    : ""
                } hover:bg-muted/20`}
              >
                <div className="text-foreground text-xs font-medium sm:text-sm">
                  {row.feature}
                </div>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {row.leadlyHas === true ? (
                    <Check
                      className="h-4 w-4 flex-shrink-0 text-green-600 sm:h-5 sm:w-5"
                      aria-label="Included"
                    />
                  ) : row.leadlyHas === "soon" ? (
                    <Clock
                      className="h-4 w-4 flex-shrink-0 text-amber-500 sm:h-5 sm:w-5"
                      aria-label="Coming Soon"
                    />
                  ) : (
                    <X
                      className="h-4 w-4 flex-shrink-0 text-red-500 sm:h-5 sm:w-5"
                      aria-label="Not Included"
                    />
                  )}
                  <span className="text-foreground/80 hidden text-xs xl:inline">
                    {row.leadly}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {row.othersHas ? (
                    <Check
                      className="text-muted-foreground/60 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                      aria-label="Included"
                    />
                  ) : (
                    <X
                      className="h-4 w-4 flex-shrink-0 text-red-400/60 sm:h-5 sm:w-5"
                      aria-label="Not Included"
                    />
                  )}
                  <span className="text-muted-foreground hidden text-xs xl:inline">
                    {row.others}
                  </span>
                </div>
              </div>
            ))}
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
            <h2 className="text-foreground font-display mb-3 text-3xl font-bold tracking-tight sm:mb-4 sm:text-4xl md:text-5xl">
              Why top founders choose Leadly
            </h2>
            <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
              Stop wasting time on keyword noise. Get straight to the leads that
              convert.
            </p>
          </motion.div>

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
                className="group bg-card border-border/60 hover:border-border relative rounded-xl p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:rounded-2xl sm:p-6"
              >
                <div className="bg-primary/8 text-primary group-hover:bg-primary/12 mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 sm:mb-5 sm:h-12 sm:w-12 sm:rounded-xl">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-base font-semibold sm:text-lg">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
