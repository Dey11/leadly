"use client";

import { motion } from "motion/react";
import {
  Settings2,
  Target,
  Zap,
  Brain,
  TrendingUp,
  FileText,
} from "lucide-react";

const features = [
  {
    badge: "Smart Monitoring Configuration",
    title: "Precision Monitoring, Zero Noise",
    description:
      "Don't waste time scrolling. Configure specific keywords and subreddits, and let Leadly filter out the noise. We only alert you when conversations match your exact Ideal Customer Profile (ICP).",
    icon: Settings2,
    highlights: [
      { icon: Target, text: "Track subreddits & keywords" },
      { icon: Zap, text: "Negative keyword filtering" },
      { icon: TrendingUp, text: "Real-time alerts" },
    ],
  },
  {
    badge: "AI Analysis",
    title: "AI That Understands Context",
    description:
      "Engagement matters. Our AI analyzes the sentiment and context of every post, giving you a buying intent score and suggesting the perfect angle for your reply.",
    icon: Brain,
    highlights: [
      { icon: TrendingUp, text: "Sentiment analysis" },
      { icon: Target, text: "Relevance filtering" },
      { icon: FileText, text: "Contextual summaries" },
    ],
  },
];

export function Features() {
  return (
    <section className="px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14 lg:mb-16"
        >
          <h2 className="text-foreground font-display mb-4 text-3xl font-bold tracking-tight sm:mb-5 sm:text-4xl md:text-5xl">
            Everything you need to capture intent
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            From monitoring to outreach, we've automated the busywork.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-6 sm:gap-8 lg:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className="group bg-card border-border/50 hover:border-border relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:shadow-lg sm:p-8"
            >
              {/* Background gradient on hover */}
              <div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                {/* Badge */}
                <div className="bg-primary/10 border-primary/20 text-primary mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm">
                  <feature.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {feature.badge}
                </div>

                {/* Title */}
                <h3 className="text-foreground font-display mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed sm:text-base">
                  {feature.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2.5 sm:space-y-3">
                  {feature.highlights.map((highlight) => (
                    <div
                      key={highlight.text}
                      className="flex items-center gap-2.5 sm:gap-3"
                    >
                      <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8">
                        <highlight.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-foreground/90 text-sm font-medium sm:text-base">
                        {highlight.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
