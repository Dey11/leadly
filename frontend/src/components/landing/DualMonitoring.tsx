"use client";

import { motion } from "motion/react";
import { Hash, Users, ArrowRight, Sparkles } from "lucide-react";

const monitoringModes = [
  {
    icon: Users,
    title: "Subreddit Monitoring",
    description:
      "Monitor entire communities where your customers hang out. Catch every relevant conversation in r/SaaS, r/startups, or any subreddit you choose.",
    examples: ["r/SaaS", "r/startups", "r/Entrepreneur"],
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/20 hover:border-blue-500/40",
  },
  {
    icon: Hash,
    title: "Keyword Monitoring",
    description:
      "Track specific terms across all of Reddit. Never miss when someone mentions your product, competitor, or pain point — anywhere.",
    examples: ['"looking for CRM"', '"alternative to Notion"', '"help with SEO"'],
    gradient: "from-purple-500/20 to-pink-500/20",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-500/20 hover:border-purple-500/40",
  },
];

export function DualMonitoring() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <div className="absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-purple-500/10 blur-[100px]" />
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary sm:mb-5 sm:px-4 sm:py-2 sm:text-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Two Ways to Find Leads
          </div>
          <h2 className="font-display text-foreground mb-4 text-3xl font-bold tracking-tight sm:mb-5 sm:text-4xl md:text-5xl">
            Monitor communities{" "}
            <span className="from-primary to-accent inline-block bg-gradient-to-r bg-clip-text text-transparent dark:from-[#e3b5a4] dark:to-[#ff6b7d]">
              or
            </span>{" "}
            track keywords
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            Use both together for comprehensive coverage. Most successful users
            combine subreddit monitoring with targeted keyword tracking.
          </p>
        </motion.div>

        {/* Two-column cards */}
        <div className="mx-auto grid max-w-5xl gap-6 sm:gap-8 md:grid-cols-2">
          {monitoringModes.map((mode, i) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{
                y: -6,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className={`group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl sm:rounded-3xl sm:p-8 ${mode.borderColor}`}
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${mode.iconBg} ${mode.iconColor} transition-transform duration-200 group-hover:scale-110 sm:h-14 sm:w-14`}
                >
                  <mode.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>

                {/* Title */}
                <h3 className="font-display text-foreground mb-3 text-xl font-bold sm:text-2xl">
                  {mode.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed sm:text-base">
                  {mode.description}
                </p>

                {/* Example tags */}
                <div className="flex flex-wrap gap-2">
                  {mode.examples.map((example) => (
                    <span
                      key={example}
                      className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur-sm sm:text-sm"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom connector showing they work together */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-4 rounded-2xl border border-border/50 bg-card/60 px-6 py-4 shadow-sm backdrop-blur-sm sm:mt-12 sm:gap-6 sm:px-8 sm:py-5"
        >
          <div className="flex -space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Hash className="h-4 w-4" />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground/80 sm:text-base">
            Combine both for{" "}
            <span className="text-primary font-semibold">maximum coverage</span>
          </p>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Never miss a lead
          </span>
        </motion.div>
      </div>
    </section>
  );
}
