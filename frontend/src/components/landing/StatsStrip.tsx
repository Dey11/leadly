"use client";

import { motion } from "motion/react";

const stats = [
  {
    value: "28",
    label: "Avg. weekly qualified leads",
    suffix: "",
  },
  {
    value: "3.2",
    label: "Lift in positive replies",
    suffix: "×",
  },
  {
    value: "6.5",
    label: "Hours saved per rep",
    suffix: "",
  },
];

const companies = [
  "Arcadia",
  "Northwind",
  "SignalStack",
  "Brightline",
  "Parallel",
];

export function StatsStrip() {
  return (
    <section className="border-border/30 relative border-y px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="container mx-auto">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 grid grid-cols-3 gap-4 sm:mb-12 sm:gap-8 md:mx-auto md:max-w-3xl"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-foreground mb-1 text-2xl font-bold sm:mb-2 sm:text-4xl md:text-5xl">
                {stat.value}
                <span className="text-primary">{stat.suffix}</span>
              </div>
              <p className="text-muted-foreground text-[10px] leading-tight sm:text-xs md:text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trusted by */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase sm:mb-6 sm:text-sm">
            Trusted by modern GTM teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-12">
            {companies.map((company, i) => (
              <motion.div
                key={company}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                className="text-muted-foreground/60 hover:text-foreground text-sm font-semibold tracking-wide transition-colors duration-200 sm:text-base md:text-lg"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
