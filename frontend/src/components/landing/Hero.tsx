"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Animated word cycling component
function AnimatedWord({
  words,
  className,
}: {
  words: string[];
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className={`relative inline-block ${className}`}>
      <motion.span
        key={currentIndex}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="from-primary to-accent inline-block bg-gradient-to-r bg-clip-text text-transparent"
      >
        {words[currentIndex]}
      </motion.span>
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:pt-20 sm:pb-20 md:pt-28 md:pb-28 lg:pt-36 lg:pb-36">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="from-primary/[0.03] to-accent/[0.02] absolute inset-0 bg-gradient-to-br via-transparent" />
        <div className="via-background/80 to-background absolute inset-0 bg-gradient-to-b from-transparent" />
      </div>

      <div className="container mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          {/* Beta badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <span className="from-primary/10 to-accent/10 border-primary/20 text-primary inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm">
              <span className="relative flex h-2 w-2">
                <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
              </span>
              <span className="hidden sm:inline">
                Now in Beta — Early Adopters Get Perks
              </span>
              <span className="sm:hidden">Beta — Early Access</span>
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-foreground font-display mb-4 text-4xl leading-tight font-bold tracking-tight sm:mb-6 sm:text-5xl sm:leading-[1.1] md:text-5xl lg:text-6xl xl:text-7xl"
          >
            Find leads on Reddit <br className="hidden sm:block" />
            <AnimatedWord
              words={[
                "automatically",
                "effortlessly",
                "instantly",
                "intelligently",
              ]}
              className="min-w-[140px] sm:min-w-[200px]"
            />
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground mx-auto mb-8 max-w-xl px-2 text-base leading-relaxed sm:mb-10 sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl"
          >
            Our AI monitors Reddit 24/7, surfacing people{" "}
            <span className="highlight-word">actively asking</span> for products
            like yours. No keyword guessing. No false positives.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8 flex flex-col items-center justify-center gap-3 sm:mb-12 sm:flex-row sm:gap-4"
          >
            <Button
              size="lg"
              className="h-12 w-full max-w-xs px-6 text-sm font-semibold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl sm:h-14 sm:w-auto sm:px-8 sm:text-base"
              asChild
            >
              <Link href="/register">
                Start Free — No Card Required
                <span className="ml-2">→</span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full max-w-xs px-6 text-sm sm:h-14 sm:w-auto sm:px-8 sm:text-base"
              asChild
            >
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="from-primary/20 to-accent/20 border-background flex h-8 w-8 items-center justify-center rounded-full border-2 bg-gradient-to-br text-sm sm:h-9 sm:w-9"
                >
                  {["🚀", "💡", "⚡", "🎯", "✨"][i - 1]}
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-center text-xs sm:text-sm">
              Trusted by{" "}
              <span className="text-foreground font-medium">
                early adopters
              </span>{" "}
              building the future
            </p>
          </motion.div>
        </div>

        {/* Dashboard Preview - Hidden on very small screens for cleaner mobile experience */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="mx-auto mt-12 max-w-5xl sm:mt-16 md:mt-20"
        >
          <div className="bg-card border-border/60 relative overflow-hidden rounded-xl border shadow-xl sm:rounded-2xl sm:shadow-2xl">
            {/* Browser chrome */}
            <div className="border-border/40 bg-muted/40 flex items-center gap-2 border-b px-3 py-2 sm:px-4 sm:py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-red-400/80 sm:h-3 sm:w-3" />
                <div className="h-2 w-2 rounded-full bg-yellow-400/80 sm:h-3 sm:w-3" />
                <div className="h-2 w-2 rounded-full bg-green-400/80 sm:h-3 sm:w-3" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                  Leadly Dashboard
                </span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="bg-background/50 p-3 sm:p-6 md:p-8">
              {/* Stats row */}
              <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-4">
                {[
                  { label: "Leads", value: "47", icon: "🎯" },
                  { label: "High Intent", value: "23", icon: "🔥" },
                  { label: "Relevance", value: "89%", icon: "✨" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card border-border/40 rounded-lg border p-2 text-center sm:rounded-xl sm:p-4"
                  >
                    <span className="text-sm sm:text-xl">{stat.icon}</span>
                    <p className="text-foreground mt-1 text-lg font-bold sm:mt-2 sm:text-2xl md:text-3xl">
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Lead cards */}
              <div className="space-y-2 sm:space-y-3">
                {[
                  {
                    subreddit: "r/startups",
                    title: "Looking for a CRM that works...",
                    score: 92,
                    time: "2h ago",
                  },
                  {
                    subreddit: "r/SaaS",
                    title: "Need lead gen tool recommendations",
                    score: 87,
                    time: "4h ago",
                  },
                  {
                    subreddit: "r/entrepreneur",
                    title: "Best way to find B2B customers?",
                    score: 94,
                    time: "6h ago",
                  },
                ].map((lead) => (
                  <div
                    key={lead.title}
                    className="bg-card border-border/40 flex items-center justify-between gap-2 rounded-lg border p-2.5 sm:gap-4 sm:rounded-xl sm:p-4"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                      <p className="text-primary text-[10px] font-medium sm:text-xs">
                        {lead.subreddit}
                      </p>
                      <p className="text-foreground truncate text-xs font-medium sm:text-sm md:text-base">
                        {lead.title}
                      </p>
                      <p className="text-muted-foreground text-[10px] sm:text-xs">
                        {lead.time}
                      </p>
                    </div>
                    <div
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold sm:px-3 sm:py-1 sm:text-xs ${
                        lead.score >= 90
                          ? "bg-green-500/15 text-green-600"
                          : "bg-yellow-500/15 text-yellow-600"
                      }`}
                    >
                      {lead.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
