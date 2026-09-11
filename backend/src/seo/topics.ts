import { siteUrl } from "../lib/site-url";

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
      { label: "Leadly", url: `/` },
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
      { label: "Leadly", url: `/` },
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
      { label: "Leadly", url: `/` },
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
      { label: "Leadly", url: `/` },
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
      { label: "Leadly", url: `/` },
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
      { label: "Leadly", url: `/` },
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
      { label: "Leadly", url: `/` },
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
      { label: "Leadly", url: `/` },
      {
        label: "Reddit Content Policy",
        url: "https://www.redditinc.com/policies/content-policy",
      },
    ],
  },
  {
    slug: "how-indie-hackers-get-their-first-customers-on-reddit",
    title: "How Indie Hackers Get Their First 10 Customers on Reddit",
    primaryKeyword: "get first customers on reddit indie hacker",
    audience: "Indie hackers and solo founders pre- or just-post-launch",
    angle:
      "Early-stage founder story-driven guide focused on zero-budget, one-person Reddit outreach before any paid channel makes sense.",
    outline: [
      "Answer-first: the fastest path from zero to your first paying users on Reddit",
      "Why Reddit beats cold outreach and paid ads for pre-revenue founders",
      "Finding the handful of threads where your exact problem is being asked about",
      "What a first reply from a no-karma account should look like",
      "Turning a single good reply into a recurring source of signups",
      "When to stop doing this manually and set up monitoring",
    ],
    internalLinks: [
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
      "/solutions/automate-your-customer-acquisition-on-reddit",
      "/alternatives/reddit-lead-generation-tools",
    ],
    sources: [
      { label: "Leadly", url: `/` },
      {
        label: "Reddit Content Policy",
        url: "https://www.redditinc.com/policies/content-policy",
      },
    ],
  },
  {
    slug: "how-ai-automation-agencies-find-clients-on-reddit",
    title: "How AI Automation Agencies Find Clients on Reddit",
    primaryKeyword: "find clients for ai automation agency on reddit",
    audience: "AI automation and workflow-automation agencies",
    angle:
      "Use-case post for a fast-growing agency category showing where automation demand actually surfaces on Reddit before it hits Google.",
    outline: [
      "Answer-first: where automation buying conversations happen on Reddit",
      "Why businesses ask Reddit before they Google 'AI automation agency'",
      "The subreddits and thread types that signal a real automation project",
      "How to pitch a build without sounding like a generic AI reseller",
      "Qualifying scope and budget before you spend time on a call",
      "Building a repeatable intake pipeline from Reddit threads",
    ],
    internalLinks: [
      "/solutions/find-high-intent-reddit-leads-for-ai-automation-agencies",
      "/solutions/find-reddit-leads-for-productized-services",
      "/alternatives/reddit-monitoring-tools-for-agencies",
    ],
    sources: [
      { label: "Leadly", url: `/` },
      { label: "Reddit", url: "https://www.reddit.com/" },
    ],
  },
  {
    slug: "turning-reddit-threads-into-sales-triggers-for-b2b-teams",
    title: "Turning Reddit Threads into Sales Triggers for B2B Teams",
    primaryKeyword: "reddit sales triggers for b2b",
    audience: "B2B sales development and revenue teams",
    angle:
      "Framework post that reframes Reddit as a trigger-event source for SDRs, sitting alongside job-change and funding alerts in a modern outbound stack.",
    outline: [
      "Answer-first: what a Reddit sales trigger actually is",
      "Why trigger-based outbound outperforms static prospect lists",
      "The five thread patterns that map to a buying trigger",
      "Routing a caught thread into your CRM and sequence tooling",
      "Writing a first-touch message that references the thread without being creepy",
      "Measuring trigger-to-meeting conversion over static outbound",
    ],
    internalLinks: [
      "/solutions/turn-reddit-threads-into-sales-triggers-for-b2b-teams",
      "/solutions/turn-reddit-conversations-into-your-gtm-engine",
      "/compare/leadly-vs-syften",
    ],
    sources: [
      { label: "Leadly", url: `/` },
      { label: "Syften", url: "https://syften.com/reddit" },
    ],
  },
  {
    slug: "how-to-write-non-promotional-reddit-replies-that-convert",
    title: "How to Write Non-Promotional Reddit Replies That Actually Convert",
    primaryKeyword: "how to reply on reddit without being promotional",
    audience:
      "SaaS founders, agencies, and anyone doing manual Reddit outreach",
    angle:
      "Tactical, example-driven writing guide addressing the single biggest execution failure across every other Reddit lead-gen angle: the reply itself.",
    outline: [
      "Answer-first: the structure of a reply that helps first and sells second",
      "Why Reddit communities punish promotional replies harder than other channels",
      "A four-part template: acknowledge, answer, disclose, offer",
      "Before-and-after examples of promotional vs. earned replies",
      "When to mention your product at all, and when to hold back",
      "How reply quality compounds into karma, trust, and long-term reach",
    ],
    internalLinks: [
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
      "/solutions/scale-your-marketing-consultancy-with-ai-powered-reddit-leads",
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
      { label: "Leadly", url: `/` },
    ],
  },
  {
    slug: "using-reddit-for-saas-market-research-and-positioning",
    title: "Using Reddit for SaaS Market Research and Positioning",
    primaryKeyword: "reddit market research for saas positioning",
    audience: "SaaS founders and product marketers refining positioning",
    angle:
      "Research-stage post distinct from demand-capture content: using Reddit language to sharpen messaging and positioning before a launch or repositioning push.",
    outline: [
      "Answer-first: what Reddit tells you that surveys and interviews don't",
      "Finding the exact words your market uses to describe the problem",
      "Mining complaint and comparison threads for positioning gaps",
      "Turning raw language into landing page copy and feature framing",
      "Validating a new position before you commit to a rewrite",
      "Keeping a living research workflow instead of a one-time audit",
    ],
    internalLinks: [
      "/solutions/use-reddit-customer-research-to-sharpen-saas-positioning",
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
    ],
    sources: [
      { label: "Leadly", url: `/` },
      { label: "Reddit", url: "https://www.reddit.com/" },
    ],
  },
  {
    slug: "how-to-measure-roi-of-reddit-lead-generation",
    title: "How to Measure the ROI of Reddit Lead Generation",
    primaryKeyword: "roi of reddit lead generation",
    audience:
      "SaaS founders, agency owners, and GTM leads justifying the channel",
    angle:
      "Decision-stage measurement post for teams already running Reddit outreach who need to prove the channel to a boss, co-founder, or budget review.",
    outline: [
      "Answer-first: the three numbers that prove Reddit is working",
      "Why last-click attribution undercounts Reddit-sourced pipeline",
      "Setting up UTMs, self-report fields, and CRM source tracking for Reddit",
      "Calculating cost per lead when the channel is mostly time, not ad spend",
      "Benchmarking Reddit against paid search and cold outbound",
      "Reporting the channel in a way that survives a budget review",
    ],
    internalLinks: [
      "/solutions/turn-reddit-conversations-into-your-gtm-engine",
      "/alternatives/reddit-lead-generation-tools",
      "/compare/leadly-vs-gummysearch",
    ],
    sources: [
      { label: "Leadly", url: `/` },
      { label: "GummySearch", url: "https://gummysearch.com/" },
    ],
  },
];
