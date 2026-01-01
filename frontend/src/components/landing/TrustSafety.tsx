"use client";

import { motion } from "motion/react";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";

const features = [
  {
    icon: EyeOff,
    title: "Read-only access",
    description:
      "Leadly only monitors public discussions. We never post, comment, or DM on your behalf.",
  },
  {
    icon: Lock,
    title: "Secure infrastructure",
    description:
      "Your data is encrypted at rest and in transit. We follow industry-standard security practices.",
  },
  {
    icon: ShieldCheck,
    title: "Ethical monitoring",
    description:
      "We respect community guidelines and rate limits to ensure sustainable, long-term access.",
  },
];

export function TrustSafety() {
  return (
    <section className="px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-border/50 bg-card mx-auto max-w-4xl rounded-xl border p-6 shadow-sm sm:rounded-2xl sm:p-10 md:p-14"
        >
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="text-foreground font-display text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              Trust & Safety
            </h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="space-y-2 text-center sm:space-y-3"
              >
                <div className="bg-primary/8 text-primary mx-auto flex h-10 w-10 items-center justify-center rounded-lg sm:h-12 sm:w-12 sm:rounded-xl">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-foreground text-sm font-semibold sm:text-base">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
