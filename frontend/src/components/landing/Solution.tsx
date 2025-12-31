"use client";

import { motion } from "motion/react";
import { CheckCircle2, Filter, ScanLine } from "lucide-react";
import { WorkflowVisual } from "@/components/landing/WorkflowVisual";

const steps = [
  {
    icon: Filter,
    title: "1. Define your ideal customer",
    description:
      "Tell Leadly which subreddits to watch and keywords to track. Set up takes minutes.",
  },
  {
    icon: ScanLine,
    title: "2. We monitor conversations 24/7",
    description:
      "Our system scans for new posts and comments, filtering out noise and spam automatically.",
  },
  {
    icon: CheckCircle2,
    title: "3. You get qualified leads",
    description:
      "Receive alerts for high-intent discussions. AI scores relevance so you only see what matters.",
  },
];

export function Solution() {
  return (
    <section
      id="how-it-works"
      className="px-4 py-16 sm:py-20 md:py-24 lg:py-28"
    >
      <div className="container mx-auto">
        <div className="mx-auto grid max-w-6xl items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8 sm:space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h2 className="text-foreground mb-4 text-2xl font-bold tracking-tight sm:mb-5 sm:text-3xl md:text-4xl lg:text-5xl">
                How Leadly works
              </h2>
              <p className="text-muted-foreground mx-auto max-w-lg text-sm leading-relaxed sm:text-base md:text-lg lg:mx-0 lg:text-xl">
                We turn millions of Reddit conversations into a structured
                pipeline of warm leads.
              </p>
            </motion.div>

            <div className="space-y-5 sm:space-y-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="flex gap-3 sm:gap-4"
                >
                  <div className="bg-primary/8 text-primary mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg sm:mt-1 sm:h-11 sm:w-11 sm:rounded-xl">
                    <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-semibold sm:text-base lg:text-lg">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed sm:mt-1.5 sm:text-sm">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card/60 border-border/50 relative aspect-square overflow-hidden rounded-2xl border shadow-lg sm:rounded-3xl"
          >
            <WorkflowVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
