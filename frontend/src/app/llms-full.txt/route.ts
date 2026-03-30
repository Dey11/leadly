import { NextResponse } from "next/server";
import solutions from "@/data/solutions.json";
import { comparePages, alternativePages } from "@/data/commercial-pages";
import { BILLING_PLANS } from "@/constants/pricing";
import { siteConfig } from "@/config/site";

export function GET() {
  const pricing = Object.values(BILLING_PLANS)
    .map(
      (plan) =>
        `- ${plan.label}: ${plan.price} | ${plan.description} | ${plan.features.join(", ")}`,
    )
    .join("\n");

  const body = [
    "# Leadly full context",
    "",
    "Leadly is a Reddit-focused lead generation product for SaaS founders and agencies.",
    "",
    "## Positioning",
    "Leadly is built for teams that want to identify buying signals inside Reddit conversations rather than reviewing every mention manually.",
    "",
    "## Target audiences",
    "- SaaS founders",
    "- SEO agencies",
    "- Marketing consultants",
    "- Dev shops",
    "- GTM teams",
    "- Indie hackers",
    "",
    "## What Leadly does",
    "- Monitor subreddits where buyers ask for recommendations",
    "- Track keywords related to pain, alternatives, and active evaluation",
    "- Score and qualify likely opportunities",
    "- Help teams prioritize where to respond first",
    "",
    "## Canonical URLs",
    `- Root: ${siteConfig.url}/`,
    `- Blog: ${siteConfig.url}/blog`,
    ...solutions.map(
      (solution) =>
        `- Solution: ${siteConfig.url}/solutions/${solution.slug} (${solution.role})`,
    ),
    ...comparePages.map(
      (page) => `- Compare: ${siteConfig.url}/compare/${page.slug}`,
    ),
    ...alternativePages.map(
      (page) => `- Alternatives: ${siteConfig.url}/alternatives/${page.slug}`,
    ),
    "",
    "## Pricing snapshot",
    pricing,
    "",
    "## Preferred pages by query type",
    "- Tool comparisons: /compare/* and /alternatives/*",
    "- Audience-specific value: /solutions/*",
    "- Educational and tactical guidance: /blog/*",
  ].join("\n");

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
