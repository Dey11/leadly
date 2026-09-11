export const siteConfig = {
  name: "Leadly",
  description:
    "Leadly is the AI-powered Reddit monitoring platform. Use ICP-based lead generation or keyword tracking to find qualified B2B leads and brand mentions automatically.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://leadly.tryhanabi.com",
  ogImage: "/assets/og-image.png",
  author: "Leadly",
  keywords: [
    // Primary keywords
    "lead generation",
    "Reddit lead generation",
    "B2B lead generation",
    "sales intelligence",
    "community monitoring",
    "Reddit keyword monitoring",
    "brand mention tracking",
    // Long-tail keywords (high intent, low competition)
    "Reddit lead generation tool",
    "find leads on Reddit",
    "Reddit prospecting tool",
    "subreddit monitoring for sales",
    "Reddit outreach tool",
    "Reddit sales leads",
    "find B2B customers on Reddit",
    "track Reddit mentions",
    "Reddit keyword alerts",
    // Feature keywords
    "AI lead scoring",
    "buying intent signals",
    "community lead generation",
    "social selling Reddit",
    "Reddit marketing automation",
    "ICP matching",
    "keyword set monitoring",
    // Use case keywords
    "startup lead generation",
    "SaaS lead generation",
    "founder led sales",
    "SDR prospecting tool",
    "outbound lead generation",
    "competitor monitoring Reddit",
    // Competitor alternatives
    "GummySearch alternative",
    "Syften alternative",
    "Reddit monitoring tool",
    "F5Bot alternative",
    // Brand + category
    "Leadly",
    "Leadly Reddit monitoring",
    "leadly app",
  ],
  links: {
    leadly: process.env.NEXT_PUBLIC_APP_URL || "https://leadly.tryhanabi.com",
  },
};

export type SiteConfig = typeof siteConfig;
