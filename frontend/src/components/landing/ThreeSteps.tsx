"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lightbulb, Radar, Inbox } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Lightbulb,
    title: "Describe your offer",
    description:
      "Create a service explaining who you help, what pain you solve, and how to recognize real buying signals.",
  },
  {
    number: "02",
    icon: Radar,
    title: "Launch precision monitors",
    description:
      "Pick subreddits or keywords, apply filters, and let Leadly watch every new thread for qualified intent.",
  },
  {
    number: "03",
    icon: Inbox,
    title: "Work the warm inbox",
    description:
      "Review prioritized leads, export for outreach, and track follow-up status from the same workspace.",
  },
];

export function ThreeSteps() {
  return (
    <section className="border-border/30 relative border-y px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      {/* Background */}
      <div className="from-muted/40 via-muted/20 to-muted/40 absolute inset-0 -z-10 bg-gradient-to-b" />

      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
        >
          <h2 className="text-foreground font-display mb-4 text-3xl font-bold tracking-tight sm:mb-5 sm:text-4xl md:text-5xl">
            Three steps to revenue
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            Launch your first monitor in under 2 minutes.
          </p>
          <Button
            size="lg"
            className="mt-6 h-11 px-6 text-sm font-semibold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl sm:mt-8 sm:h-12 sm:px-8 sm:text-base"
            asChild
          >
            <Link href="/register">
              Start now
              <span className="ml-2">→</span>
            </Link>
          </Button>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-4 sm:gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className="group bg-card border-border/50 hover:border-border relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-lg sm:p-6"
            >
              {/* Gradient overlay on hover */}
              <div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                {/* Step number */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-primary/30 text-3xl font-bold sm:text-4xl">
                    {step.number}
                  </span>
                  <div className="bg-primary/8 text-primary group-hover:bg-primary/12 flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 sm:h-12 sm:w-12">
                    <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-foreground mb-2 text-base font-semibold sm:mb-3 sm:text-lg">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
