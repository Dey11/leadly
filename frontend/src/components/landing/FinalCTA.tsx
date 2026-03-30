"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-4 py-16 text-center sm:py-20 md:py-24 lg:py-28">
      {/* Subtle background gradient */}
      <div className="from-primary/[0.04] via-primary/[0.02] absolute inset-0 -z-10 bg-gradient-to-t to-transparent" />

      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl space-y-6 sm:space-y-8"
        >
          <h2 className="text-foreground font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl">
            Stop missing high-intent leads on Reddit.
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed text-balance sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            Start free and catch buyer intent while people are actively asking
            for alternatives, recommendations, and help on Reddit.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row sm:pt-4"
          >
            <Button
              size="lg"
              className="h-12 w-full max-w-xs px-8 text-base font-semibold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl sm:h-14 sm:w-auto sm:px-10 sm:text-lg"
              asChild
            >
              <Link href="/register">
                Start Monitoring Free
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground flex flex-col items-center justify-center gap-2 text-xs sm:flex-row sm:gap-4 sm:text-sm"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-green-600">✓</span>
              No credit card required
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-600">✓</span>
              Current pricing locked in
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-600">✓</span>
              Cancel anytime
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
