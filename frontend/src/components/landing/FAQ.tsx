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
    question: "How is this different from basic Reddit or Google alerts?",
    answer:
      "Basic alerts tell you a keyword appeared. Leadly is built to help SaaS founders and agencies find conversations that look commercially useful, like recommendation requests, alternative searches, and urgent problem statements.",
  },
  {
    question: "Do I need a Reddit account to use Leadly?",
    answer:
      "No! Leadly works independently. We monitor public Reddit discussions on your behalf. You don't need to connect any accounts or give us any Reddit credentials.",
  },
  {
    question: "Who is Leadly best for?",
    answer:
      "Leadly is best for SaaS founders, SEO agencies, marketing consultants, dev shops, and GTM teams that want to turn Reddit demand into pipeline. It is less useful if you only want passive mention tracking.",
  },
  {
    question: "What's the difference between subreddit and keyword monitoring?",
    answer:
      "Subreddit monitoring helps you stay close to the communities where your buyers ask questions. Keyword monitoring is useful when you want to catch alternatives, category phrases, or pain terms across a wider surface area. For most SaaS and agency workflows, subreddit monitoring should lead and keyword monitoring should support it.",
  },
  {
    question: "Is this compliant with Reddit's Terms of Service?",
    answer:
      "Yes. We only access publicly available information through proper channels. We don't violate rate limits, scrape private content, or do anything that would breach Reddit's ToS. We're built for the long term.",
  },
  {
    question: "How quickly can I expect useful leads after setup?",
    answer:
      "That depends on your schedule and target communities, but most useful setups produce their first relevant threads within the first day. The fastest results usually come from monitoring recommendation, alternative, and implementation-help conversations in focused subreddits.",
  },
  {
    question: "What counts as a 'scrape' in my monthly limit?",
    answer:
      "One scrape = one monitoring check of a subreddit on your list. If you have 3 subreddits and run daily scans, that's 3 scrapes per day per monitor. We show your usage clearly in the dashboard so there are no surprises.",
  },
  {
    question: "Can I try before I pay?",
    answer:
      "Yes. The free plan is there so you can validate that your target subreddits and keyword ideas produce useful conversations before you commit to a paid plan.",
    },
];

interface FAQProps {
  items?: { question: string; answer: string }[];
}

export function FAQ({ items }: FAQProps) {
  // Use passed items or fallback to default faqs (first 5 for brevity or all)
  const displayFaqs = items || faqs;

  return (
    <section className="relative px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          // ... (keep header motion)
          className="mb-10 text-center sm:mb-12"
        >
          <h2 className="text-foreground font-display mb-4 text-3xl font-bold tracking-tight sm:mb-5 sm:text-4xl md:text-5xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            Straight answers for founders and agencies evaluating Reddit as a
            lead source.
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <motion.div
        // ...
        >
          <Accordion
            type="single"
            collapsible
            className="space-y-2 sm:space-y-3"
          >
            {displayFaqs.map((faq, i) => (
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
