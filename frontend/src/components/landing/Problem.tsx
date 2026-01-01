"use client";

import { motion } from "motion/react";
import { MessageSquareOff, SearchX, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: MessageSquareOff,
    title: "Cold emails are ignored",
    description:
      "Open rates are plummeting. Prospects are tired of generic outreach hitting their inbox.",
  },
  {
    icon: SearchX,
    title: "Ads are expensive & low intent",
    description:
      "You pay for clicks from people who aren't ready to buy, burning through your budget.",
  },
  {
    icon: TrendingDown,
    title: "You're missing active buyers",
    description:
      "People ask for recommendations daily on Reddit, but manual searching takes hours.",
  },
];

export function Problem() {
  return (
    <section className="border-border/30 relative border-y px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      {/* Subtle background */}
      <div className="from-muted/40 via-muted/20 to-muted/40 absolute inset-0 -z-10 bg-gradient-to-b" />

      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14 lg:mb-16"
        >
          <h2 className="text-foreground font-display mb-4 text-3xl font-bold tracking-tight sm:mb-6 sm:text-4xl md:text-5xl">
            Why traditional lead gen is broken
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            High-intent buyers are asking for recommendations on Reddit every
            hour in niche subs. The problem? These conversations are buried, and
            finding them manually is impossible.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-4 sm:gap-6 md:grid-cols-3">
          {problems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border-border/50 rounded-xl p-5 shadow-sm sm:rounded-2xl sm:p-6"
            >
              <div className="bg-primary/8 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-lg sm:mb-5 sm:h-12 sm:w-12 sm:rounded-xl">
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
    </section>
  );
}
