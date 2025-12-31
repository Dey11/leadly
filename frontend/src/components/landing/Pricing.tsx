"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

import { BILLING_PLANS, PLAN_ORDER } from "@/constants/pricing";

export function Pricing() {
  return (
    <section
      id="pricing"
      className="border-border/30 relative border-y px-4 py-16 sm:py-20 md:py-24 lg:py-28"
    >
      {/* Subtle background */}
      <div className="from-muted/40 via-muted/20 to-muted/40 absolute inset-0 -z-10 bg-gradient-to-b" />

      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
        >
          <h2 className="text-foreground mb-4 text-2xl font-bold tracking-tight sm:mb-5 sm:text-3xl md:text-4xl lg:text-5xl">
            Simple, predictable pricing
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-sm leading-relaxed sm:max-w-2xl sm:px-0 sm:text-base md:text-lg lg:text-xl">
            Start free. Upgrade only when you see value.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-4 sm:gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((tier, i) => {
            const plan = BILLING_PLANS[tier];
            const isRecommended = tier === "PRO";
            const ctaText =
              tier === "FREE"
                ? "Start Free"
                : tier === "PRO"
                  ? "Start Trial"
                  : "Contact Sales";
            const href =
              tier === "FREE"
                ? "/register"
                : tier === "PRO"
                  ? "/register?plan=pro"
                  : "mailto:sales@leadly.live";

            return (
              <motion.div
                key={plan.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card
                  className={`relative flex h-full flex-col transition-shadow duration-200 hover:shadow-md ${
                    isRecommended
                      ? "border-primary/40 shadow-md"
                      : "border-border/60"
                  }`}
                >
                  {isRecommended && (
                    <div className="bg-primary text-primary-foreground absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[10px] font-medium sm:-top-3 sm:px-3 sm:py-1 sm:text-xs">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="p-4 pt-6 sm:p-6 sm:pt-8">
                    <CardTitle className="text-xl sm:text-2xl">
                      {plan.label}
                    </CardTitle>
                    <div className="mt-3 flex items-baseline text-3xl font-bold sm:mt-4 sm:text-4xl">
                      {plan.price}
                      {plan.monthlyPriceInt > 0 && (
                        <span className="text-muted-foreground ml-1.5 text-sm font-normal sm:ml-2 sm:text-base">
                          /mo
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1.5 text-xs sm:mt-2 sm:text-sm">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 p-4 pt-0 sm:p-6 sm:pt-0">
                    <ul className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-xs sm:text-sm"
                        >
                          <Check className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 sm:p-6 sm:pt-0">
                    <Button
                      className="w-full text-sm sm:text-base"
                      variant={isRecommended ? "default" : "outline"}
                      asChild
                    >
                      <Link href={href}>{ctaText}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
