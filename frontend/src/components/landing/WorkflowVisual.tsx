"use client";

import { motion } from "motion/react";
import { Search, Brain, Target, ArrowRight } from "lucide-react";

const steps = [
  {
    id: "monitor",
    icon: Search,
    title: "Monitor",
    subtitle: "Scanning Reddit",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: "analyze",
    icon: Brain,
    title: "Analyze",
    subtitle: "AI Intent Scoring",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    id: "deliver",
    icon: Target,
    title: "Deliver",
    subtitle: "Qualified Leads",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
  },
];

export function WorkflowVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-8">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="bg-primary/20 h-48 w-48 rounded-full blur-3xl sm:h-64 sm:w-64"
        />
      </div>

      {/* Flow diagram */}
      <div className="relative flex w-full max-w-md flex-col items-center gap-3 sm:gap-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="flex w-full flex-col items-center"
          >
            {/* Step card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-card/80 border-border/50 flex w-full items-center gap-3 rounded-xl border p-3 shadow-sm backdrop-blur-sm sm:gap-4 sm:rounded-2xl sm:p-4"
            >
              {/* Icon */}
              <div
                className={`${step.bgColor} flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12`}
              >
                <step.icon
                  className={`h-5 w-5 sm:h-6 sm:w-6 ${step.iconColor}`}
                />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h4 className="text-foreground text-sm font-semibold sm:text-base">
                  {step.title}
                </h4>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {step.subtitle}
                </p>
              </div>

              {/* Step number */}
              <div className="text-muted-foreground/40 text-xl font-bold sm:text-2xl">
                {index + 1}
              </div>
            </motion.div>

            {/* Connector arrow */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                whileInView={{ opacity: 1, scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }}
                className="flex h-6 flex-col items-center justify-center sm:h-8"
              >
                <div className="from-border to-border/30 h-full w-px bg-gradient-to-b" />
                <ArrowRight className="text-muted-foreground/50 h-3 w-3 rotate-90 sm:h-4 sm:w-4" />
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Final result indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-2 flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 sm:mt-3 sm:px-4 sm:py-2"
        >
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs font-medium text-green-600 sm:text-sm">
            Ready for outreach
          </span>
        </motion.div>
      </div>
    </div>
  );
}
