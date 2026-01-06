"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Lock, MessageSquare, Gift, Crown, Rocket } from "lucide-react";
import Link from "next/link";

const perks = [
  {
    icon: MessageSquare,
    title: "Direct Founder Access",
    description: "Shape the product roadmap with your feedback.",
  },
  {
    icon: Gift,
    title: "Extended Free Usage",
    description: "Extra scrapes and monitors beyond limits.",
  },
  {
    icon: Lock,
    title: "Locked-in Pricing Forever",
    description:
      "Beta users keep their current rate. Prices will increase — yours won't.",
    highlight: true,
  },
  {
    icon: Crown,
    title: "Founding Member Badge",
    description: "Exclusive status in our community forever.",
  },
  {
    icon: Rocket,
    title: "Priority Feature Access",
    description: "Get new features first before public release.",
  },
];

export function BetaPerks() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      {/* Background Gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f7] to-[#f5ebe5] dark:from-[#18181b] dark:to-[#09090b]" />
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-[#773344]/15 blur-[80px] dark:bg-[#773344]/30" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-[#1e40af]/10 blur-[80px] dark:bg-[#1e40af]/20" />
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="border-primary/20 from-primary/10 to-accent/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-3 py-1.5 text-xs font-medium sm:mb-6 sm:px-4 sm:py-2 sm:text-sm"
          >
            Limited Beta Access
          </motion.div>
          <h2 className="font-display text-foreground mb-4 text-3xl font-bold tracking-tight sm:mb-5 sm:text-4xl md:text-5xl">
            Early adopters get{" "}
            <span className="from-primary to-accent inline-block bg-gradient-to-r bg-clip-text text-transparent dark:from-[#e3b5a4] dark:to-[#ff6b7d]">
              exclusive perks
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            We're building Leadly with our first users. Join now and enjoy
            benefits that won't be available after launch.
          </p>
        </motion.div>

        {/* Cards Grid: 3 columns - left (2 cards), center (1 tall), right (2 cards) */}
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {/* Left Column - 2 stacked cards */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {perks.slice(0, 2).map((perk, i) => (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group border-border/50 hover:border-primary/20 dark:bg-card relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md sm:p-6"
                >
                  <div className="bg-primary/10 text-primary group-hover:bg-primary/20 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                    <perk.icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-foreground mb-2 text-base font-bold">
                    {perk.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {perk.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Center Column - Featured tall card with gradient */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative overflow-hidden rounded-3xl shadow-2xl"
            >
              {/* Light mode gradient - warm rose/peach */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#c9a0a0] via-[#e8c4c0] to-[#faf0ed] dark:hidden" />

              {/* Dark mode gradient - richer burgundy/rose with better contrast */}
              <div className="absolute inset-0 hidden bg-gradient-to-br from-[#5a2838] via-[#8a4558] to-[#6a3545] dark:block" />

              {/* Content - bottom aligned, left aligned */}
              <div className="relative flex h-full min-h-[280px] flex-col justify-end p-6 sm:min-h-[320px] sm:p-8">
                {/* Title */}
                <h3 className="text-2xl font-bold tracking-tight text-[#4a2030] sm:text-3xl dark:text-white">
                  Locked-In
                </h3>
                <h3 className="mb-4 text-2xl font-bold tracking-tight text-[#773344] sm:text-3xl dark:text-[#f5d5dd]">
                  Pricing
                </h3>

                {/* Description */}
                <p className="max-w-[220px] text-sm leading-relaxed font-medium text-[#5a3540] dark:text-white/90">
                  Your rate stays the same forever, even when prices go up.
                </p>
              </div>
            </motion.div>

            {/* Right Column - 2 stacked cards */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {perks.slice(3, 5).map((perk, i) => (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i + 2) * 0.1 }}
                  className="group border-border/50 hover:border-primary/20 dark:bg-card relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md sm:p-6"
                >
                  <div className="bg-primary/10 text-primary group-hover:bg-primary/20 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                    <perk.icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-foreground mb-2 text-base font-bold">
                    {perk.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {perk.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Full Width CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 sm:mt-12"
          >
            <Button
              size="lg"
              className="h-12 w-full text-base font-semibold shadow-lg sm:h-14 sm:text-lg"
              asChild
            >
              <Link href="/register">
                <span className="md:hidden">Join the beta →</span>
                <span className="hidden md:inline">
                  Join the beta and lock in pricing forever →
                </span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
