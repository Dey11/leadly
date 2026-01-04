"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

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
        className="from-primary to-accent inline-block bg-gradient-to-r bg-clip-text text-transparent dark:from-[#e3b5a4] dark:to-[#ff6b7d]"
      >
        {words[currentIndex]}
      </motion.span>
    </span>
  );
}

// Stats data
const stats = [
  { value: "500+", label: "Leads Found" },
  { value: "24/7", label: "Monitoring" },
  { value: "98%", label: "Accuracy" },
];

export function Hero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dashboardImg =
    mounted && resolvedTheme === "dark"
      ? "/dashboard-dark.png"
      : "/dashboard.png";

  return (
    <section className="relative px-3 pt-3 pb-0 sm:px-4 sm:pt-4 md:px-6 md:pt-6">
      {/* Hero Container with rounded corners - nearly full width */}
      <div className="relative mx-auto w-full overflow-hidden rounded-3xl sm:rounded-[2rem]">
        {/* Background Gradient - positioned inside container */}
        <div className="pointer-events-none absolute inset-0">
          {/* Base light background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f7] to-[#f5ebe5] dark:from-[#18181b] dark:to-[#09090b]" />

          {/* Gradient blobs - more visible */}
          <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#773344]/25 blur-[80px] dark:bg-[#773344]/40" />
          <div className="absolute -bottom-20 left-1/3 h-[400px] w-[400px] rounded-full bg-[#e3b5a4]/50 blur-[80px] dark:bg-[#e3b5a4]/30" />
          <div className="absolute right-1/4 -bottom-40 h-[450px] w-[450px] rounded-full bg-[#d44d5c]/20 blur-[80px] dark:bg-[#d44d5c]/30" />
          <div className="absolute -right-20 bottom-0 h-[350px] w-[350px] rounded-full bg-[#bde0fe]/30 blur-[80px] dark:bg-[#60a5fa]/20" />

          {/* Grain overlay */}
          <div
            className="absolute inset-0 opacity-10 dark:opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 pt-20 pb-0 sm:px-10 sm:pt-24 md:px-16 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-muted-foreground mb-4 text-xs font-medium tracking-[0.2em] uppercase sm:mb-5 sm:text-sm"
            >
              AI-Powered Lead Generation
            </motion.p>

            {/* Main headline - reduced size */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-foreground font-display mb-4 text-3xl leading-[1.15] font-bold tracking-tight sm:mb-5 sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Find Leads on Reddit <br className="hidden sm:block" />
              <AnimatedWord
                words={[
                  "Automatically",
                  "Effortlessly",
                  "Instantly",
                  "Intelligently",
                ]}
                className="min-w-[140px] sm:min-w-[200px]"
              />
            </motion.h1>

            {/* Subheadline - more concise */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground mx-auto mb-6 max-w-xl text-sm leading-relaxed sm:mb-8 sm:text-base md:text-lg"
            >
              Unlock seamless lead discovery with our AI that monitors Reddit
              24/7, surfacing people actively asking for products like yours.
            </motion.p>

            {/* CTA button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 sm:mb-10"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-foreground/10 bg-background hover:border-foreground/20 dark:hover:bg-sidebar-accent h-11 rounded-full px-8 text-sm font-medium shadow-sm transition-all hover:scale-105 hover:shadow-md sm:h-12 sm:px-10 sm:text-base"
                asChild
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </motion.div>
          </div>

          {/* Dashboard Preview - with glassy border */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative mx-auto max-w-4xl"
          >
            {/* Glassy border container */}
            <div className="rounded-t-xl border border-b-0 border-white/40 bg-white/20 p-2 pb-0 shadow-2xl backdrop-blur-sm sm:rounded-t-2xl sm:p-3 sm:pb-0 dark:border-white/10 dark:bg-white/5">
              <div className="bg-card relative overflow-hidden rounded-t-lg sm:rounded-t-xl">
                <div className="relative w-full">
                  <img
                    src="/dashboard.png"
                    alt="Leadly Dashboard Light"
                    className={`-mt-[5px] block h-auto w-full transition-opacity duration-500 ${
                      mounted && resolvedTheme === "dark"
                        ? "absolute inset-0 opacity-0"
                        : "relative opacity-100"
                    }`}
                  />
                  <img
                    src="/dashboard-dark.png"
                    alt="Leadly Dashboard Dark"
                    className={`-mt-[5px] block h-auto w-full transition-opacity duration-500 ${
                      mounted && resolvedTheme === "dark"
                        ? "relative opacity-100"
                        : "absolute inset-0 opacity-0"
                    }`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section - Outside container, below */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex items-center justify-center gap-6 py-8 sm:gap-10 sm:py-10"
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center sm:flex-row sm:items-baseline"
          >
            <span className="text-foreground text-lg font-bold sm:text-xl md:text-2xl">
              {stat.value}
            </span>
            <span className="text-muted-foreground text-xs sm:ml-1.5 sm:text-sm">
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
