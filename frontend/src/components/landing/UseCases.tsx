"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Building2, Rocket } from "lucide-react";

const useCases = [
  {
    icon: Rocket,
    title: "SaaS Founders",
    description:
      "Find users actively looking for alternatives to your competitors.",
    pain: "Stop wasting time on channels that don't convert.",
  },
  {
    icon: Building2,
    title: "Agencies",
    description:
      "Fill your pipeline with businesses stating they need your services.",
    pain: "Move beyond referrals and cold lists.",
  },
  {
    icon: Briefcase,
    title: "Consultants",
    description:
      "Identify companies struggling with the exact problems you solve.",
    pain: "Engage when the pain is highest.",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
        >
          <h2 className="text-foreground mb-4 text-2xl font-bold tracking-tight sm:mb-5 sm:text-3xl md:text-4xl lg:text-5xl">
            Built for every GTM motion
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-sm leading-relaxed sm:max-w-2xl sm:px-0 sm:text-base md:text-lg lg:text-xl">
            Whether you're a founder, agency, or consultant — Leadly helps you
            find your next customers faster.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-4 sm:gap-6 md:grid-cols-3">
          {useCases.map((useCase, i) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
            >
              <Card className="bg-card border-border/50 hover:border-border h-full shadow-sm transition-all duration-200 hover:shadow-md">
                <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
                  <div className="bg-primary/8 text-primary mb-2 flex h-9 w-9 items-center justify-center rounded-lg sm:mb-3 sm:h-11 sm:w-11 sm:rounded-xl">
                    <useCase.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">
                    {useCase.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0 sm:space-y-3 sm:p-6 sm:pt-0">
                  <p className="text-foreground/90 text-sm font-medium sm:text-base">
                    {useCase.description}
                  </p>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {useCase.pain}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
