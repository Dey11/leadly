"use client";

import { motion } from "motion/react";
import { MessageSquareOff, SearchX, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

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
    <section className="relative px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="container mx-auto">
        {/* Heading above the box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-8 max-w-3xl text-center sm:mb-10 lg:mb-12"
        >
          <h2 className="text-foreground font-display mb-4 text-3xl font-bold tracking-tight sm:mb-6 sm:text-4xl md:text-5xl">
            Why traditional lead gen is broken
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            High-intent buyers are asking for recommendations on Reddit every
            hour. The problem? These conversations are buried.
          </p>
        </motion.div>

        {/* Main box with gradient - theme-aware */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="border-border/50 relative mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-gradient-to-br from-[#f5e9e2] via-[#e3b5a4]/30 to-[#773344]/15 sm:rounded-3xl dark:from-[#18181b] dark:via-[#2d1f24] dark:to-[#3d1a22]"
        >
          {/* Radial gradient overlay for wine glow effect */}
          {/* Light mode gradient overlays */}
          <div
            className="absolute inset-0 opacity-60 dark:opacity-0"
            style={{
              background:
                "radial-gradient(ellipse at 0% 0%, rgba(245, 233, 226, 0.8) 0%, transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-50 dark:opacity-0"
            style={{
              background:
                "radial-gradient(ellipse at 100% 80%, rgba(212, 77, 92, 0.2) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-40 dark:opacity-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(119, 51, 68, 0.15) 0%, transparent 50%)",
            }}
          />
          {/* Dark mode gradient overlays */}
          <div
            className="absolute inset-0 opacity-0 dark:opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at 80% 50%, rgba(119, 51, 68, 0.3) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-0 dark:opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at 100% 100%, rgba(212, 77, 92, 0.3) 0%, transparent 50%)",
            }}
          />

          <div className="relative z-10 grid items-center gap-8 p-6 sm:p-8 md:grid-cols-2 md:gap-12 lg:p-12">
            {/* Left: Pain points */}
            <div className="space-y-5 sm:space-y-6">
              {problems.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12 sm:rounded-xl dark:bg-white/10 dark:text-[#e3b5a4]">
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-foreground mb-1 text-base font-semibold sm:text-lg dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm dark:text-white/60">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="pt-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="group bg-primary hover:bg-primary/90 rounded-full px-6 py-3 font-semibold transition-all duration-200 dark:bg-[#e3b5a4] dark:text-[#2d1f24] dark:hover:bg-[#d4a494]"
                >
                  <Link href="/signup" className="flex items-center gap-2">
                    Get Started
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Right: Growth image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-full max-w-xs sm:max-w-sm">
                <Image
                  src="/growth.png"
                  alt="Growth chart showing upward trend"
                  width={320}
                  height={256}
                  className="h-auto w-full object-contain"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
