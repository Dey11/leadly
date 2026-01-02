"use client";

import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SUPPORT_EMAIL } from "@/constants/config";

const faqs = [
  {
    question: "How is this different from setting up Google Alerts?",
    answer:
      "Google Alerts work for indexed web pages but miss most Reddit content due to how Reddit handles indexing. Plus, they're keyword-based — you'll get every mention, relevant or not. Leadly uses AI to understand intent, so you only see posts from people actually looking to buy.",
  },
  {
    question: "Do I need a Reddit account to use Leadly?",
    answer:
      "No! Leadly works independently. We monitor public Reddit discussions on your behalf. You don't need to connect any accounts or give us any Reddit credentials.",
  },
  {
    question: "Is this compliant with Reddit's Terms of Service?",
    answer:
      "Yes. We only access publicly available information through proper channels. We don't violate rate limits, scrape private content, or do anything that would breach Reddit's ToS. We're built for the long term.",
  },
  {
    question: "How quickly do I see leads after setup?",
    answer:
      "It depends on your monitoring schedule and subreddit activity. Free users get a daily scan, while Pro and Premium users can monitor more frequently (up to hourly). Most users see their first relevant leads within 24 hours.",
  },
  {
    question: "What counts as a 'scrape' in my monthly limit?",
    answer:
      "One scrape = one monitoring check of a subreddit on your list. If you have 3 subreddits and run daily scans, that's 3 scrapes per day per monitor. We show your usage clearly in the dashboard so there are no surprises.",
  },
  {
    question: "Can I try before I pay?",
    answer:
      "Absolutely! Our Free tier gives you 3 subreddits to monitor with 30 scrapes per month. No credit card required. Upgrade only if you see value and need more capacity.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data is yours. You can export your leads at any time. If you cancel, we keep your data for 30 days in case you change your mind, then permanently delete everything.",
  },
  {
    question: "Do you support platforms other than Reddit?",
    answer:
      "We're focused on Reddit for now since that's where the highest-intent B2B conversations happen. We're exploring other platforms like Twitter/X and HackerNews based on user demand.",
  },
];

export function FAQ() {
  return (
    <section className="relative px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
        >
          <h2 className="text-foreground font-display mb-4 text-3xl font-bold tracking-tight sm:mb-5 sm:text-4xl md:text-5xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            Everything you need to know about Leadly
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mx-auto max-w-3xl"
        >
          <Accordion
            type="single"
            collapsible
            className="space-y-2 sm:space-y-3"
          >
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border-border/50 data-[state=open]:border-border rounded-lg border px-4 transition-colors data-[state=open]:shadow-sm sm:rounded-xl sm:px-6"
              >
                <AccordionTrigger className="hover:text-primary py-3 text-left text-sm font-medium hover:no-underline sm:py-5 sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-3 text-xs leading-relaxed sm:pb-5 sm:text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center sm:mt-12"
        >
          <p className="text-muted-foreground text-xs sm:text-sm">
            Still have questions?{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Reach out to us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
