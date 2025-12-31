"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Search, Brain, Target } from "lucide-react";

const steps = [
  {
    id: "monitor",
    icon: Search,
    title: "Monitoring Reddit...",
    subtitle: "r/startups, r/SaaS",
    color: "bg-blue-500",
  },
  {
    id: "analyze",
    icon: Brain,
    title: "High Intent Detected",
    subtitle: "Score: 98/100",
    color: "bg-purple-500",
  },
  {
    id: "deliver",
    icon: Target,
    title: "Lead Delivered",
    subtitle: "Ready for your outreach",
    color: "bg-green-500",
  },
];

export function WorkflowVisual() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center p-8">
      {/* Background circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="bg-primary/10 h-64 w-64 rounded-full blur-3xl"
        />
      </div>

      <div className="relative w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Icon Circle */}
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl ${steps[activeStep].color} text-white`}
            >
              {(() => {
                const Icon = steps[activeStep].icon;
                return <Icon className="h-10 w-10" />;
              })()}
            </div>

            {/* Text Content */}
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                {steps[activeStep].title}
              </h3>
              <p className="text-muted-foreground text-lg">
                {steps[activeStep].subtitle}
              </p>
            </div>

            {/* Progress Indicators */}
            <div className="mt-4 flex gap-2">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: 4,
                    width: i === activeStep ? 24 : 8,
                    opacity: i === activeStep ? 1 : 0.3,
                    backgroundColor:
                      i === activeStep ? "var(--primary)" : "currentColor",
                  }}
                  className="bg-foreground rounded-full transition-all duration-300"
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mock Interface Background (Subtle) */}
        <div className="border-border/50 absolute top-1/2 left-1/2 -z-10 h-48 w-64 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-dashed opacity-50" />
      </div>
    </div>
  );
}
