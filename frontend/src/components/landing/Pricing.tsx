"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
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
          <h2 className="text-foreground font-display mb-4 text-3xl font-bold tracking-tight sm:mb-5 sm:text-4xl md:text-5xl">
            Simple, predictable pricing
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            Start free. Upgrade only when you see value.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-4 sm:gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((tier, i) => {
            const plan = BILLING_PLANS[tier];
            const isRecommended = tier === "PRO";

            return (
              <motion.div
                key={plan.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                className={`relative ${isRecommended ? "md:-my-4" : ""}`}
              >
                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isRecommended
                      ? "border-primary/50 from-primary/5 shadow-primary/10 bg-gradient-to-b to-transparent shadow-xl"
                      : "border-border/60 bg-card hover:border-border hover:shadow-lg"
                  }`}
                >
                  {/* Popular badge */}
                  {isRecommended && (
                    <div className="bg-primary text-primary-foreground absolute -top-px right-0 left-0 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </div>
                  )}

                  <div
                    className={`p-5 sm:p-6 ${isRecommended ? "pt-10 sm:pt-12" : "pt-6 sm:pt-8"}`}
                  >
                    {/* Plan name */}
                    <h3 className="text-foreground font-display text-xl font-bold sm:text-2xl">
                      {plan.label}
                    </h3>

                    {/* Price */}
                    <div className="mt-4 flex flex-col items-start gap-1">
                      {plan.discountLabel && (
                        <span className="bg-primary/10 text-primary self-start rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                          {plan.discountLabel}
                        </span>
                      )}

                      <div className="flex items-baseline gap-2">
                        <span className="text-foreground text-4xl font-bold sm:text-5xl">
                          {plan.price}
                        </span>

                        {plan.originalPrice && (
                          <span className="text-muted-foreground/60 text-lg font-semibold line-through">
                            {plan.originalPrice}
                          </span>
                        )}

                        {plan.monthlyPriceInt > 0 && (
                          <span className="text-muted-foreground text-sm font-medium sm:text-base">
                            /month
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground mt-2 text-sm">
                      {plan.description}
                    </p>

                    {/* CTA Button */}
                    <Button
                      className={`mt-6 w-full text-sm font-semibold sm:text-base ${
                        isRecommended
                          ? "shadow-primary/25 hover:shadow-primary/30 h-12 shadow-lg hover:shadow-xl"
                          : "h-11"
                      }`}
                      variant={isRecommended ? "default" : "outline"}
                      asChild
                    >
                      <Link href={plan.href}>{plan.ctaLabel}</Link>
                    </Button>

                    {/* Divider */}
                    <div className="border-border/50 my-6 border-t" />

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${isRecommended ? "text-primary" : "text-green-600"}`}
                          />
                          <span className="text-foreground/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
