"use client";

import { motion } from "motion/react";
import { Hash, Users, Sparkles } from "lucide-react";

export function DualMonitoring() {
  return (
    <section className="relative overflow-hidden px-4 py-12 sm:py-16 md:py-20 lg:py-24">
      {/* Rich gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f7] via-[#f8f0ec] to-[#faf8f7] dark:from-[#0c0a0b] dark:via-[#1a1215] dark:to-[#0c0a0b]" />
        {/* Animated gradient blobs */}
        <div className="absolute top-1/3 left-1/4 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#773344]/5 blur-[120px] dark:bg-[#773344]/20" />
        <div className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] rounded-full bg-[#e3b5a4]/15 blur-[100px] dark:bg-[#e3b5a4]/10" />
      </div>

      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center sm:mb-20"
        >
          <div className="border-primary/20 bg-primary/5 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium sm:mb-8">
            <Sparkles className="h-4 w-4" />
            Two Ways to Monitor
          </div>
          <h2 className="font-display text-foreground mb-6 text-4xl font-bold tracking-tight sm:mb-8 sm:text-5xl md:text-6xl">
            Communities{" "}
            <span className="text-muted-foreground font-light">+</span> Keywords
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl text-lg leading-relaxed sm:text-xl">
            Combine both approaches for comprehensive lead coverage across
            Reddit.
          </p>
        </motion.div>

        {/* Two-column cards with distinct styling */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          {/* Subreddit Monitoring Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative"
          >
            {/* Card glow effect */}
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-[#773344]/20 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

            <div className="bg-card border-border/50 relative h-full overflow-hidden rounded-[1.75rem] border p-6 shadow-sm transition-all duration-300 group-hover:border-[#773344]/30 group-hover:shadow-xl sm:p-8">
              <div className="relative z-10 flex h-full flex-col">
                {/* Icon with robust coloring */}
                <div className="bg-primary text-primary-foreground shadow-primary/20 mb-8 flex aspect-square h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
                  <Users className="h-7 w-7 sm:h-9 sm:w-9" />
                </div>

                {/* Title */}
                <h3 className="font-display text-foreground mb-4 text-2xl font-bold sm:text-3xl">
                  Subreddit Monitoring
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-8 flex-grow text-base leading-relaxed sm:text-lg">
                  Track entire communities where your customers hang out. Get
                  notified for every relevant conversation happening in
                  real-time.
                </p>

                {/* Example subreddits */}
                <div className="flex flex-wrap gap-2.5">
                  {[
                    "r/SaaS",
                    "r/startups",
                    "r/Entrepreneur",
                    "r/smallbusiness",
                  ].map((sub) => (
                    <span
                      key={sub}
                      className="border-border bg-muted/50 text-foreground/80 rounded-full border px-4 py-2 text-xs font-semibold transition-colors group-hover:border-[#773344]/20 group-hover:bg-[#773344]/5 group-hover:text-[#773344] dark:group-hover:text-[#e3b5a4]"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Keyword Monitoring Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative"
          >
            {/* Card glow effect */}
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-[#e3b5a4]/30 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

            <div className="bg-card border-border/50 relative h-full overflow-hidden rounded-[1.75rem] border p-6 shadow-sm transition-all duration-300 group-hover:border-[#e3b5a4]/40 group-hover:shadow-xl sm:p-8">
              <div className="relative z-10 flex h-full flex-col">
                {/* Icon with robust coloring */}
                <div className="bg-foreground text-background shadow-foreground/20 mb-8 flex aspect-square h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
                  <Hash className="h-7 w-7 sm:h-9 sm:w-9" />
                </div>

                {/* Title */}
                <h3 className="font-display text-foreground mb-4 text-2xl font-bold sm:text-3xl">
                  Keyword Monitoring
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-8 flex-grow text-base leading-relaxed sm:text-lg">
                  Track specific terms across all of Reddit. Never miss when
                  someone mentions your product or asks for alternatives.
                </p>

                {/* Example keywords */}
                <div className="flex flex-wrap gap-2.5">
                  {[
                    '"looking for CRM"',
                    '"Notion alternative"',
                    '"help with SEO"',
                  ].map((keyword) => (
                    <span
                      key={keyword}
                      className="border-border bg-muted/50 text-foreground/80 rounded-full border px-4 py-2 text-xs font-semibold transition-colors group-hover:border-[#e3b5a4]/30 group-hover:bg-[#e3b5a4]/10 group-hover:text-[#5c2836] dark:group-hover:text-[#e3b5a4]"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom "combine both" badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex justify-center sm:mt-16"
        >
          <div className="border-border bg-card/80 inline-flex items-center gap-4 rounded-full border px-8 py-4 shadow-sm backdrop-blur-sm transition-transform hover:scale-105">
            <div className="flex -space-x-3">
              <div className="bg-primary text-primary-foreground ring-background flex h-10 w-10 items-center justify-center rounded-full ring-2">
                <Users className="h-5 w-5" />
              </div>
              <div className="bg-foreground text-background ring-background flex h-10 w-10 items-center justify-center rounded-full ring-2">
                <Hash className="h-5 w-5" />
              </div>
            </div>
            <span className="text-foreground text-base font-semibold">
              Use both for{" "}
              <span className="text-primary">maximum coverage</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
