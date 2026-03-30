export type BlogBrief = {
  slug: string;
  title: string;
  primaryKeyword: string;
  audience: string;
  angle: string;
  outline: string[];
  internalLinks: string[];
  sources: Array<{ label: string; url: string }>;
};

export const BLOG_STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072",
  "https://images.unsplash.com/photo-1504384308090-c54be3855485?auto=format&fit=crop&q=80&w=2370",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2370",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2370",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2301",
];

export const BLOG_BRIEFS: BlogBrief[] = [
  {
    slug: "best-reddit-lead-generation-tools-for-saas-founders",
    title: "Best Reddit Lead Generation Tools for SaaS Founders in 2026",
    primaryKeyword: "reddit lead generation tools for saas founders",
    audience: "SaaS founders and lean GTM teams",
    angle:
      "Commercial comparison post covering Leadly, Syften, F5Bot, and GummySearch with founder-first framing.",
    outline: [
      "What makes a Reddit lead generation tool useful",
      "How founder-led teams should evaluate signal quality",
      "Tool-by-tool comparison table",
      "When each tool makes sense",
      "Why Leadly fits pipeline-focused teams",
    ],
    internalLinks: [
      "/compare/leadly-vs-syften",
      "/compare/leadly-vs-f5bot",
      "/compare/leadly-vs-gummysearch",
      "/alternatives/reddit-lead-generation-tools",
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
    ],
    sources: [
      { label: "Leadly", url: "https://leadly.live/" },
      { label: "Syften", url: "https://syften.com/reddit" },
      { label: "F5Bot", url: "https://f5bot.com/" },
      { label: "GummySearch", url: "https://gummysearch.com/" },
    ],
  },
  {
    slug: "syften-vs-f5bot-vs-leadly-for-reddit-monitoring",
    title:
      "Syften vs F5Bot vs Leadly for Reddit Monitoring and Lead Generation",
    primaryKeyword: "syften vs f5bot vs leadly",
    audience: "Founders and agencies comparing monitoring products",
    angle:
      "Decision-stage comparison for buyers choosing between alert-first and intent-first workflows.",
    outline: [
      "Quick answer for who should pick which tool",
      "The difference between monitoring and lead generation",
      "Comparison table for workflow, fit, and pricing model",
      "Which product wins for agencies and SaaS founders",
      "Implementation guidance for getting value quickly",
    ],
    internalLinks: [
      "/compare/leadly-vs-syften",
      "/compare/leadly-vs-f5bot",
      "/alternatives/reddit-monitoring-tools-for-agencies",
    ],
    sources: [
      { label: "Leadly", url: "https://leadly.live/" },
      { label: "Syften", url: "https://syften.com/reddit" },
      { label: "F5Bot", url: "https://f5bot.com/" },
    ],
  },
  {
    slug: "how-saas-founders-find-customers-on-reddit-without-getting-banned",
    title: "How SaaS Founders Find Customers on Reddit Without Getting Banned",
    primaryKeyword: "how to find customers on reddit for saas",
    audience: "SaaS founders",
    angle:
      "Educational post that teaches demand capture on Reddit without spammy tactics.",
    outline: [
      "Answer-first summary of what works",
      "What founders get wrong on Reddit",
      "Which thread types signal real buying intent",
      "How to respond without sounding promotional",
      "How to build a lightweight monitoring system",
    ],
    internalLinks: [
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
      "/alternatives/reddit-lead-generation-tools",
    ],
    sources: [
      {
        label: "Reddit Content Policy",
        url: "https://www.redditinc.com/policies/content-policy",
      },
      {
        label: "Reddit Moderator Code of Conduct",
        url: "https://www.redditinc.com/policies/moderator-code-of-conduct",
      },
      { label: "Leadly", url: "https://leadly.live/" },
    ],
  },
  {
    slug: "how-agencies-turn-reddit-requests-into-inbound-leads",
    title: "How Agencies Turn Reddit Requests into Inbound Leads",
    primaryKeyword: "reddit lead generation for agencies",
    audience: "SEO agencies, marketing consultants, and dev shops",
    angle:
      "Use-case post showing how agencies can turn recommendation and rescue-project threads into pipeline.",
    outline: [
      "What agency demand looks like on Reddit",
      "The three agency thread types worth monitoring",
      "How to qualify fit fast",
      "How to reply with useful expertise",
      "Operational workflow for a small agency team",
    ],
    internalLinks: [
      "/solutions/scale-your-seo-agency-with-high-intent-reddit-leads",
      "/solutions/scale-your-dev-shop-with-high-intent-reddit-leads",
      "/alternatives/reddit-monitoring-tools-for-agencies",
    ],
    sources: [
      { label: "Leadly", url: "https://leadly.live/" },
      { label: "Syften", url: "https://syften.com/reddit" },
      { label: "F5Bot", url: "https://f5bot.com/" },
    ],
  },
  {
    slug: "what-counts-as-high-intent-on-reddit",
    title:
      "What Counts as High Intent on Reddit? A Practical Framework for SaaS Teams",
    primaryKeyword: "high intent reddit",
    audience: "SaaS founders and GTM teams",
    angle:
      "Framework post defining high-intent Reddit signals and how to separate urgency from curiosity.",
    outline: [
      "Direct answer: what high intent actually looks like",
      "The difference between curiosity and purchase intent",
      "Language patterns that matter",
      "How to score urgency and fit",
      "How to turn the framework into a monitoring workflow",
    ],
    internalLinks: [
      "/solutions/turn-reddit-conversations-into-your-gtm-engine",
      "/alternatives/reddit-lead-generation-tools",
    ],
    sources: [
      { label: "Leadly", url: "https://leadly.live/" },
      {
        label: "Princeton GEO paper",
        url: "https://arxiv.org/abs/2311.09735",
      },
    ],
  },
  {
    slug: "reddit-keyword-monitoring-vs-intent-based-lead-generation",
    title: "Reddit Keyword Monitoring vs Intent-Based Lead Generation",
    primaryKeyword: "reddit keyword monitoring vs lead generation",
    audience: "Teams comparing alerting and qualification workflows",
    angle:
      "Bottom-funnel explainer on why alert volume and pipeline quality are not the same thing.",
    outline: [
      "Quick answer for which approach wins when",
      "Where keyword monitoring helps",
      "Where intent-led workflows win",
      "How agencies and founders should choose",
      "When to combine both approaches",
    ],
    internalLinks: [
      "/alternatives/reddit-monitoring-tools-for-agencies",
      "/alternatives/reddit-lead-generation-tools",
      "/compare/leadly-vs-f5bot",
    ],
    sources: [
      { label: "Leadly", url: "https://leadly.live/" },
      { label: "F5Bot", url: "https://f5bot.com/" },
      { label: "Syften", url: "https://syften.com/reddit" },
    ],
  },
  {
    slug: "best-subreddits-for-saas-customer-research-and-demand-capture",
    title: "Best Subreddits for SaaS Customer Research and Demand Capture",
    primaryKeyword: "best subreddits for saas customer research",
    audience: "SaaS founders and indie hackers",
    angle:
      "Middle-funnel post showing where founders should look first and what to watch for inside each community.",
    outline: [
      "What makes a subreddit useful for demand capture",
      "The subreddits worth starting with",
      "What signals to watch in each community",
      "How to avoid wasting time",
      "How to connect research to pipeline",
    ],
    internalLinks: [
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
      "/solutions/automate-your-customer-acquisition-on-reddit",
    ],
    sources: [
      { label: "Leadly", url: "https://leadly.live/" },
      { label: "Reddit", url: "https://www.reddit.com/" },
    ],
  },
  {
    slug: "how-to-monitor-competitor-alternatives-on-reddit",
    title: "How to Monitor Competitor Alternatives on Reddit",
    primaryKeyword: "monitor competitor alternatives on reddit",
    audience: "GTM teams, founders, and agencies",
    angle:
      "Practical workflow for capturing buyer-switch intent and replacement demand on Reddit.",
    outline: [
      "Why alternatives threads matter",
      "Which phrases and subreddits to monitor",
      "How to qualify replacement intent",
      "What to do after you catch a thread",
      "How to avoid spammy replies",
    ],
    internalLinks: [
      "/solutions/turn-reddit-conversations-into-your-gtm-engine",
      "/compare/leadly-vs-gummysearch",
      "/compare/leadly-vs-syften",
    ],
    sources: [
      { label: "Leadly", url: "https://leadly.live/" },
      {
        label: "Reddit Content Policy",
        url: "https://www.redditinc.com/policies/content-policy",
      },
    ],
  },
];
