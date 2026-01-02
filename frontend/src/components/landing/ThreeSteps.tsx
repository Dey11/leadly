"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Describe your offer",
    description:
      "Tell us who you help and what problems you solve. We'll identify the buying signals that matter.",
  },
  {
    number: "2",
    title: "Launch monitors",
    description:
      "Pick subreddits and keywords to watch. Leadly scans every new post for qualified buyer intent.",
  },
  {
    number: "3",
    title: "Work the inbox",
    description:
      "Review prioritized leads in one place. Export contacts and start your outreach instantly.",
  },
];

export function ThreeSteps() {
  return (
    <section className="relative overflow-hidden bg-[#4a1e28] px-4 py-12 sm:py-14 md:py-16 lg:py-20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
        >
          {/* Section label */}
          <p className="mb-3 text-xs font-medium tracking-[0.2em] text-[#e3b5a4] uppercase sm:mb-4 sm:text-sm">
            STEP
          </p>
          <h2 className="font-display mb-4 text-3xl font-bold tracking-tight text-white sm:mb-5 sm:text-4xl md:text-5xl">
            Three steps to revenue
          </h2>
          <p className="mx-auto max-w-xl px-2 text-base leading-relaxed text-white/70 sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            Launch your first monitor in under 2 minutes.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-4 sm:gap-5 md:grid-cols-3">
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
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#5c2836] px-6 py-4 transition-all duration-200 hover:border-white/20 hover:bg-[#6a2e3e] sm:px-8 sm:py-5"
            >
              <div className="relative">
                {/* Large step number with progressive fade */}
                <div className="mb-1 h-16 overflow-hidden sm:h-20 md:h-24">
                  <span
                    className="font-display block text-7xl leading-none font-bold text-white/40 sm:text-8xl md:text-9xl"
                    style={{
                      maskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0) 90%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0) 90%)",
                    }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-base font-semibold text-white sm:mb-3 sm:text-lg">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-xs leading-relaxed text-white/60 sm:text-sm">
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
