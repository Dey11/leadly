"use client";

import { motion } from "motion/react";
import { CheckCircle2, Filter, ScanLine } from "lucide-react";
import { WorkflowVisual } from "@/components/landing/WorkflowVisual";

const steps = [
  {
    icon: Filter,
    title: "1. Focus the search surface",
    description:
      "Pick the subreddits, categories, and keyword patterns that reflect where your buyers already ask for help.",
  },
  {
    icon: ScanLine,
    title: "2. Catch the right conversations",
    description:
      "Leadly watches Reddit continuously so your team does not need to search manually to catch active recommendation and alternative threads.",
  },
  {
    icon: CheckCircle2,
    title: "3. Act on the best threads first",
    description:
      "Use context and relevance cues to decide what deserves a reply now, what to watch, and what to ignore.",
  },
];

interface SolutionProps {
  heading?: string;
  subheading?: string;
  items?: { icon?: any; title: string; description: string }[];
}

export function Solution({
  heading = "How Leadly turns Reddit into a working acquisition channel",
  subheading = "Instead of treating Reddit like a giant alert feed, Leadly helps small teams move from discovery to action with a tighter operating loop.",
  items,
}: SolutionProps) {
  const displaySteps = items || steps;

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
              <h2 className="text-foreground font-display mb-4 text-3xl font-bold tracking-tight sm:mb-5 sm:text-4xl md:text-5xl">
                {heading}
              </h2>
              <p className="text-muted-foreground mx-auto max-w-lg text-base leading-relaxed sm:text-lg md:text-lg lg:mx-0 lg:text-xl">
                {subheading}
              </p>
            </motion.div>

            <div className="space-y-5 sm:space-y-6">
              {displaySteps.map((step, i) => {
                const Icon = step.icon || CheckCircle2; // Fallback
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="flex gap-3 sm:gap-4"
                  >
                    <div className="bg-primary/8 text-primary mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg sm:mt-1 sm:h-11 sm:w-11 sm:rounded-xl">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
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
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card/60 border-border/50 relative min-h-[320px] overflow-hidden rounded-2xl border shadow-lg sm:min-h-[400px] sm:rounded-3xl lg:aspect-square lg:min-h-0"
          >
            <WorkflowVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
