"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Lock,
  MessageSquare,
  Gift,
  Crown,
  Rocket,
} from "lucide-react";
import Link from "next/link";

const perks = [
  {
    icon: Lock,
    title: "Locked-In Pricing Forever",
    description:
      "Beta users keep their current rate even after we launch. Prices will increase — yours won't.",
    highlight: true,
  },
  {
    icon: MessageSquare,
    title: "Direct Access to Founders",
    description:
      "Shape the roadmap. Your feedback goes straight to the team building Leadly.",
  },
  {
    icon: Gift,
    title: "Extended Free Usage",
    description:
      "Beta users get extra scrapes and monitors beyond normal limits while we refine the product.",
  },
  {
    icon: Crown,
    title: "Founding Member Badge",
    description:
      "Be recognized as an early believer. Exclusive status in our community.",
  },
  {
    icon: Rocket,
    title: "Priority Feature Access",
    description:
      "Get new features first. Help us test and perfect them before public release.",
  },
  {
    icon: Sparkles,
    title: "White-Glove Onboarding",
    description:
      "Personal setup assistance. We'll help you configure monitors for your exact ICP.",
  },
];

export function BetaPerks() {
  return (
    <section className="border-border/30 relative overflow-hidden border-y px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      {/* Subtle background gradient */}
      <div className="from-muted/50 via-muted/30 to-muted/50 absolute inset-0 -z-10 bg-gradient-to-b" />

      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="from-primary/10 to-accent/10 border-primary/20 text-primary mb-4 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-3 py-1.5 text-xs font-medium sm:mb-6 sm:px-4 sm:py-2 sm:text-sm"
          >
            <span>🎁</span>
            Limited Beta Access
          </motion.div>
          <h2 className="text-foreground font-display mb-4 text-3xl font-bold tracking-tight sm:mb-5 sm:text-4xl md:text-5xl">
            Early adopters get{" "}
            <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
              exclusive perks
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            We're building Leadly with our first users. Join now and enjoy
            benefits that won't be available after launch.
          </p>
        </motion.div>

        {/* Perks grid */}
        <div className="mx-auto mb-10 grid max-w-6xl grid-cols-1 gap-3 sm:mb-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {perks.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
              }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className={`group bg-card relative rounded-xl p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:rounded-2xl sm:p-6 ${
                perk.highlight
                  ? "border-primary/30 border"
                  : "border-border/50 hover:border-border border"
              }`}
            >
              {perk.highlight && (
                <div className="bg-primary text-primary-foreground absolute -top-2.5 left-3 rounded-full px-2 py-0.5 text-[10px] font-medium sm:-top-3 sm:left-4 sm:px-3 sm:py-1 sm:text-xs">
                  Most Popular
                </div>
              )}
              <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 sm:mb-4 sm:h-11 sm:w-11 sm:rounded-xl ${
                  perk.highlight
                    ? "bg-primary/12 text-primary"
                    : "bg-primary/8 text-primary group-hover:bg-primary/12"
                }`}
              >
                <perk.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-foreground mb-1.5 text-sm font-semibold sm:mb-2 sm:text-base">
                {perk.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {perk.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            size="lg"
            className="h-12 w-full max-w-xs px-8 text-sm font-semibold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl sm:h-14 sm:w-auto sm:px-10 sm:text-base"
            asChild
          >
            <Link href="/register">
              Claim Your Beta Spot
              <span className="ml-2">→</span>
            </Link>
          </Button>
          <p className="text-muted-foreground mt-3 text-xs sm:mt-4 sm:text-sm">
            Free to start · No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
