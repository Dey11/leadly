export type CommercialFaq = {
  question: string;
  answer: string;
};

export type ComparisonRow = {
  label: string;
  leadly: string;
  competitor: string;
};

export type CommercialPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  competitorLabel: string;
  verdict: string;
  bestFor: string[];
  sections: Array<{
    title: string;
    body: string;
  }>;
  comparisonRows: ComparisonRow[];
  faqs: CommercialFaq[];
  ctaLabel: string;
  ctaHref: string;
};

export const comparePages: CommercialPage[] = [
  {
    slug: "leadly-vs-syften",
    title: "Leadly vs Syften for SaaS founders and agencies",
    description:
      "Compare Leadly and Syften for Reddit lead generation, AI lead scoring, keyword alerts, and workflow fit for SaaS founders and agencies.",
    eyebrow: "Competitor comparison",
    competitorLabel: "Syften",
    verdict:
      "Choose Leadly when you want Reddit lead discovery tied to intent, scoring, and action. Choose Syften when you mainly need broad keyword-style monitoring across many sources.",
    bestFor: [
      "SaaS founders who want to catch recommendation and alternative threads",
      "Agencies that need qualified Reddit opportunities instead of raw alert volume",
      "Teams that want ICP thinking instead of only keyword syntax",
    ],
    sections: [
      {
        title: "Where Leadly is stronger",
        body: "Leadly is built around finding buying signals, not just mentions. It is better suited to teams that care about reply timing, qualification, and workflow fit for Reddit-led pipeline generation.",
      },
      {
        title: "Where Syften is stronger",
        body: "Syften is broader and more established as a monitoring product. Teams that want multi-source alerting and are comfortable doing their own filtering may still prefer it.",
      },
    ],
    comparisonRows: [
      {
        label: "Best fit",
        leadly: "SaaS founders and agencies turning Reddit into pipeline",
        competitor: "Operators who want broad monitoring across channels",
      },
      {
        label: "Lead qualification",
        leadly: "AI relevance scoring and context-aware filtering",
        competitor: "Manual review after alerting",
      },
      {
        label: "Reddit workflow",
        leadly: "Built around buyer-intent conversations and alternatives",
        competitor: "Monitoring-first workflow",
      },
      {
        label: "Keyword alerts",
        leadly: "Supported, but secondary to intent-led discovery",
        competitor: "Core product strength",
      },
      {
        label: "Pricing model",
        leadly: "Free tier plus low-cost self-serve plans",
        competitor: "Paid monitoring plans",
      },
    ],
    faqs: [
      {
        question: "Is Syften better for broad monitoring?",
        answer:
          "Yes, if your main goal is broad mention tracking across channels. Leadly is the stronger fit when your goal is turning Reddit demand into qualified leads and fast replies.",
      },
      {
        question: "Is Leadly only for Reddit?",
        answer:
          "Today, yes. That focus is intentional so the product can go deeper on subreddit discovery, intent scoring, and Reddit-specific buying signals for founders and agencies.",
      },
    ],
    ctaLabel: "Start free with Leadly",
    ctaHref: "/register",
  },
  {
    slug: "leadly-vs-f5bot",
    title: "Leadly vs F5Bot for Reddit lead generation",
    description:
      "See how Leadly compares with F5Bot for Reddit alerts, lead qualification, intent scoring, and day-to-day workflow for SaaS founders and agencies.",
    eyebrow: "Competitor comparison",
    competitorLabel: "F5Bot",
    verdict:
      "Choose Leadly when you need quality over noise. Choose F5Bot when you only need simple Reddit alerts and are fine with filtering the rest yourself.",
    bestFor: [
      "Small SaaS teams that want fewer false positives",
      "Agencies that need a cleaner queue of opportunities",
      "Teams graduating from simple mention alerts",
    ],
    sections: [
      {
        title: "Where Leadly is stronger",
        body: "Leadly adds qualification, context, and workflow structure on top of Reddit monitoring. It helps teams spend time on likely opportunities rather than reviewing every mention.",
      },
      {
        title: "Where F5Bot is stronger",
        body: "F5Bot is simple and familiar for alerting use cases. If your need is basic coverage with a low-friction setup, it remains a strong lightweight option.",
      },
    ],
    comparisonRows: [
      {
        label: "Primary job",
        leadly: "Find and qualify buying-signal threads",
        competitor: "Deliver Reddit alerts",
      },
      {
        label: "Intent scoring",
        leadly: "Built in",
        competitor: "Not the core model",
      },
      {
        label: "Workflow for outreach",
        leadly: "Designed for founder and agency pipeline work",
        competitor: "Alert inbox style workflow",
      },
      {
        label: "Noise control",
        leadly: "AI filtering and relevance framing",
        competitor: "Keyword-driven",
      },
      {
        label: "Pricing model",
        leadly: "Free plus paid growth tiers",
        competitor: "Free-focused monitoring",
      },
    ],
    faqs: [
      {
        question: "Should I start with F5Bot or Leadly?",
        answer:
          "If you only need simple alerting, F5Bot can be enough. If you are already trying to convert Reddit activity into revenue, Leadly is the more complete workflow.",
      },
      {
        question: "Why not just use alerts and review manually?",
        answer:
          "Manual review works at very low volume. Once a team wants repeatable pipeline from Reddit, false positives and review time become the main bottleneck.",
      },
    ],
    ctaLabel: "Start free with Leadly",
    ctaHref: "/register",
  },
  {
    slug: "leadly-vs-gummysearch",
    title: "Leadly vs GummySearch for founder-led Reddit growth",
    description:
      "Compare Leadly and GummySearch for Reddit discovery, lead generation, customer research, and agency or SaaS founder workflows.",
    eyebrow: "Competitor comparison",
    competitorLabel: "GummySearch",
    verdict:
      "Choose Leadly when the end goal is pipeline and lead capture. Choose GummySearch when the main goal is research, audience discovery, and community insight.",
    bestFor: [
      "Founders who want recommendation threads and buying signals",
      "Agencies that need revenue-generating Reddit workflows",
      "Teams choosing between research-led and pipeline-led Reddit tools",
    ],
    sections: [
      {
        title: "Where Leadly is stronger",
        body: "Leadly is more commercial in orientation. It focuses on identifying active demand, surfacing likely opportunities, and helping teams respond faster.",
      },
      {
        title: "Where GummySearch is stronger",
        body: "GummySearch is strong for Reddit audience research, trend discovery, and idea mining. Teams doing customer development may still prefer it for insight-first workflows.",
      },
    ],
    comparisonRows: [
      {
        label: "Primary use case",
        leadly: "Lead generation from Reddit demand",
        competitor: "Audience research and community mining",
      },
      {
        label: "Buying-signal focus",
        leadly: "Core product direction",
        competitor: "Secondary to research use cases",
      },
      {
        label: "Agency workflow fit",
        leadly: "Strong for pipeline and reply opportunities",
        competitor: "Better for strategic research",
      },
      {
        label: "SaaS founder fit",
        leadly: "Useful for pipeline and competitor-alternative monitoring",
        competitor: "Useful for customer discovery and positioning work",
      },
      {
        label: "Pricing model",
        leadly: "Free plus low-cost plans",
        competitor: "Paid research product",
      },
    ],
    faqs: [
      {
        question: "Can these tools work together?",
        answer:
          "Yes. Some teams use GummySearch for research and Leadly for day-to-day pipeline capture. The choice depends on whether research or revenue is the immediate priority.",
      },
      {
        question: "Which tool is better for agencies?",
        answer:
          "Leadly is the better fit when the agency goal is converting Reddit demand into meetings, proposals, and clients.",
      },
    ],
    ctaLabel: "Start free with Leadly",
    ctaHref: "/register",
  },
];

export const alternativePages: CommercialPage[] = [
  {
    slug: "reddit-lead-generation-tools",
    title: "Best Reddit lead generation tools for SaaS founders",
    description:
      "A practical comparison of Reddit lead generation tools for SaaS founders who want to find alternatives, recommendation threads, and active buying signals.",
    eyebrow: "Alternatives roundup",
    competitorLabel: "Lead generation tools",
    verdict:
      "If the goal is founder-led pipeline, prioritize tools that reduce noise, highlight buying intent, and make action obvious. Monitoring without qualification is rarely enough.",
    bestFor: [
      "Founders building pipeline without a full SDR function",
      "Lean GTM teams using Reddit for discovery and demand capture",
      "Operators comparing lightweight alerts vs intent-led workflows",
    ],
    sections: [
      {
        title: "What to look for",
        body: "The best tool is not the one with the most alerts. It is the one that helps you identify recommendation threads, alternative searches, and urgent problem statements with the least manual review.",
      },
      {
        title: "Why Leadly is included",
        body: "Leadly is designed for founders who want a Reddit-native lead workflow with ICP context, keyword support, and a tighter fit for revenue work.",
      },
    ],
    comparisonRows: [
      {
        label: "Leadly",
        leadly: "Best for founders who want intent-led Reddit pipeline",
        competitor: "Free tier, scoring, and focused workflow",
      },
      {
        label: "Syften",
        leadly: "Best for broad multi-source monitoring",
        competitor: "Monitoring-first workflow",
      },
      {
        label: "F5Bot",
        leadly: "Best for lightweight alerting",
        competitor: "Simple and familiar alerts",
      },
      {
        label: "GummySearch",
        leadly: "Best for research and community insight",
        competitor: "Idea and customer research focus",
      },
    ],
    faqs: [
      {
        question:
          "What is the biggest mistake founders make with Reddit lead gen?",
        answer:
          "They optimize for mention volume instead of buying-signal quality. That creates review fatigue and turns Reddit into another noisy feed instead of a revenue channel.",
      },
      {
        question:
          "Should I optimize for keyword tracking or lead scoring first?",
        answer:
          "If the goal is revenue, lead scoring and intent interpretation usually matter more first. Keyword tracking is useful, but it should support the pipeline workflow rather than replace it.",
      },
    ],
    ctaLabel: "Start free with Leadly",
    ctaHref: "/register",
  },
  {
    slug: "reddit-monitoring-tools-for-agencies",
    title: "Best Reddit monitoring tools for agencies",
    description:
      "The best Reddit monitoring tools for agencies that want to find clients, alternative requests, and urgent problem statements without drowning in noisy alerts.",
    eyebrow: "Alternatives roundup",
    competitorLabel: "Agency monitoring tools",
    verdict:
      "Agencies need fewer, better opportunities. Tools that surface urgency, qualification, and conversation context beat raw mention feeds for real client acquisition.",
    bestFor: [
      "SEO, content, dev, and GTM agencies",
      "Agency owners moving beyond referrals and cold lists",
      "Teams using Reddit for inbound-style outbound",
    ],
    sections: [
      {
        title: "What agencies need",
        body: "Agencies need to find recommendation requests, dissatisfaction with current vendors, and category education moments where expert replies can win trust quickly.",
      },
      {
        title: "Why Leadly is relevant",
        body: "Leadly is built to help agencies capture Reddit demand with clearer qualification and a simpler founder-friendly workflow than broader monitoring suites.",
      },
    ],
    comparisonRows: [
      {
        label: "Leadly",
        leadly: "Best for agencies that want qualified Reddit opportunities",
        competitor: "Lead-gen-first workflow",
      },
      {
        label: "Syften",
        leadly: "Best for broad monitoring operations",
        competitor: "Powerful mention coverage",
      },
      {
        label: "F5Bot",
        leadly: "Best for simple keyword alerting",
        competitor: "Low-friction alerts",
      },
      {
        label: "GummySearch",
        leadly: "Best for strategy and research teams",
        competitor: "Community and voice-of-customer discovery",
      },
    ],
    faqs: [
      {
        question: "Do agencies really win clients from Reddit?",
        answer:
          "Yes, when they show up in the right threads with useful answers. The best opportunities come from alternative requests, category confusion, and visible dissatisfaction with current tools or vendors.",
      },
      {
        question: "What should agencies monitor first?",
        answer:
          "Start with competitor alternatives, service-category recommendations, and phrases that reveal active pain such as replacement urgency, growth bottlenecks, or delivery issues.",
      },
    ],
    ctaLabel: "Start free with Leadly",
    ctaHref: "/register",
  },
];
