import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import slugify from "slugify";
import { z } from "zod";
import db from "../lib/db";
import { generateAIObject } from "../lib/ai";
import { BLOG_STOCK_IMAGES } from "../seo/topics";

type BulkBlogBrief = {
  title: string;
  slug: string;
  primaryKeyword: string;
  audience: string;
  searchIntent: string;
  angle: string;
  sections: string[];
  internalLinks: string[];
  sourceUrls: Array<{ label: string; url: string }>;
};

const SITE_URL = "https://leadly.live";
const AUTHOR_NAME = "Leadly Editorial";
const AUTHOR_ROLE = "Reddit Demand Research";
const COOLDOWN_MS = Number(process.env.BULK_BLOG_COOLDOWN_MS ?? "12000");

const SHARED_SOURCES = {
  leadly: { label: "Leadly", url: "https://leadly.live/" },
  redditPolicy: {
    label: "Reddit Content Policy",
    url: "https://www.redditinc.com/policies/content-policy",
  },
  redditUserAgreement: {
    label: "Reddit User Agreement",
    url: "https://www.redditinc.com/policies/user-agreement",
  },
  redditAds: {
    label: "Reddit for Business",
    url: "https://www.business.reddit.com/",
  },
  googleHelpful: {
    label: "Google Search Central people-first content guidance",
    url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
  },
  googleStructuredData: {
    label: "Google Search Central structured data guidance",
    url: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
  },
  princetonGeo: {
    label: "Generative Engine Optimization research",
    url: "https://arxiv.org/abs/2311.09735",
  },
  ftcEndorsements: {
    label: "FTC endorsement guides",
    url: "https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking",
  },
};

function brief(
  title: string,
  primaryKeyword: string,
  audience: string,
  searchIntent: string,
  angle: string,
  sections: string[],
  internalLinks: string[],
  sourceUrls = [
    SHARED_SOURCES.leadly,
    SHARED_SOURCES.redditPolicy,
    SHARED_SOURCES.googleHelpful,
  ],
): BulkBlogBrief {
  return {
    title,
    slug: slugify(title, { lower: true, strict: true }),
    primaryKeyword,
    audience,
    searchIntent,
    angle,
    sections,
    internalLinks,
    sourceUrls,
  };
}

const BULK_BLOG_BRIEFS: BulkBlogBrief[] = [
  brief(
    "Reddit Lead Generation Playbook for Bootstrapped SaaS Founders",
    "reddit lead generation for bootstrapped SaaS",
    "Bootstrapped SaaS founders",
    "Founder wants a practical acquisition workflow without paid ads",
    "Show how founders can turn public pain, recommendations, and alternative threads into a daily pipeline routine.",
    [
      "What to monitor first",
      "How to define buyer intent before searching",
      "The daily review workflow",
      "Reply templates that do not feel spammy",
      "How to measure whether Reddit is producing pipeline",
    ],
    [
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
      "/alternatives/reddit-lead-generation-tools",
    ],
  ),
  brief(
    "How to Find SaaS Buyers Asking for Alternatives on Reddit",
    "find SaaS buyers asking for alternatives on Reddit",
    "SaaS founders and GTM teams",
    "Buyer wants competitor alternative monitoring tactics",
    "Focus on replacement-demand language and how to respond before a shortlist forms.",
    [
      "Why alternative threads matter",
      "Search phrases that reveal replacement demand",
      "How to separate complaints from purchase intent",
      "How to reply with evidence",
      "How Leadly operationalizes the workflow",
    ],
    [
      "/compare/leadly-vs-syften",
      "/compare/leadly-vs-gummysearch",
      "/alternatives/reddit-lead-generation-tools",
    ],
  ),
  brief(
    "Best Reddit Monitoring Workflow for Founder-Led Sales",
    "reddit monitoring workflow for founder led sales",
    "Founder-led sales teams",
    "Founder wants a repeatable weekly Reddit sales workflow",
    "Explain a practical workflow that keeps the founder in control while reducing manual scanning.",
    [
      "Where founder-led sales wins on Reddit",
      "What to monitor daily versus weekly",
      "How to qualify fit quickly",
      "How to avoid over-automating replies",
      "What to track in the first 30 days",
    ],
    [
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
      "/blog/what-counts-as-high-intent-on-reddit",
    ],
  ),
  brief(
    "How SEO Agencies Can Find Clients on Reddit Without Cold Outreach",
    "find SEO clients on Reddit",
    "SEO agencies",
    "Agency owner wants non-cold outreach acquisition ideas",
    "Show Reddit as a demand capture channel for recommendation, traffic drop, and vendor replacement threads.",
    [
      "What SEO client demand looks like on Reddit",
      "Which threads deserve a reply",
      "How to answer without pitching too early",
      "How to build an agency monitoring queue",
      "How to turn replies into booked calls",
    ],
    [
      "/solutions/scale-your-seo-agency-with-high-intent-reddit-leads",
      "/alternatives/reddit-monitoring-tools-for-agencies",
    ],
    [
      SHARED_SOURCES.leadly,
      SHARED_SOURCES.redditPolicy,
      SHARED_SOURCES.ftcEndorsements,
    ],
  ),
  brief(
    "Reddit Client Acquisition for Marketing Consultants",
    "reddit client acquisition for marketing consultants",
    "Marketing consultants",
    "Consultant wants better client acquisition channels",
    "Position Reddit as a place to find active growth pain rather than generic audience research.",
    [
      "What consulting demand sounds like",
      "How to find urgent growth bottlenecks",
      "How to qualify budget and timing signals",
      "How to reply with useful diagnostic thinking",
      "How to keep a lightweight pipeline",
    ],
    [
      "/solutions/scale-your-marketing-consultancy-with-ai-powered-reddit-leads",
      "/alternatives/reddit-lead-generation-tools",
    ],
  ),
  brief(
    "How Dev Shops Can Use Reddit to Find High-Intent Project Leads",
    "reddit leads for dev shops",
    "Development agencies and dev shops",
    "Agency wants project lead generation tactics",
    "Cover rescue projects, build-versus-buy threads, and software implementation questions.",
    [
      "Where dev-shop demand appears on Reddit",
      "Signals that a project is real",
      "How to avoid vendor spam",
      "How to show proof without hijacking the thread",
      "How to build a weekly project lead review",
    ],
    [
      "/solutions/scale-your-dev-shop-with-high-intent-reddit-leads",
      "/alternatives/reddit-monitoring-tools-for-agencies",
    ],
  ),
  brief(
    "Reddit Demand Capture vs Social Listening for SaaS Teams",
    "reddit demand capture vs social listening",
    "SaaS GTM teams",
    "Team compares social listening with buyer-intent capture",
    "Explain why mention volume is not the same as pipeline and when each workflow makes sense.",
    [
      "Quick distinction",
      "Where social listening helps",
      "Where demand capture wins",
      "How to combine both without drowning in alerts",
      "How to score business impact",
    ],
    [
      "/alternatives/reddit-monitoring-tools-for-agencies",
      "/alternatives/reddit-lead-generation-tools",
    ],
  ),
  brief(
    "How to Score Reddit Buying Intent for SaaS Pipeline",
    "score Reddit buying intent",
    "SaaS founders and sales teams",
    "Team needs a framework for evaluating Reddit threads",
    "Give a scoring rubric for pain, urgency, fit, and actionability.",
    [
      "The four-part intent score",
      "Pain signals",
      "Urgency signals",
      "Fit signals",
      "Actionability and reply timing",
    ],
    [
      "/blog/what-counts-as-high-intent-on-reddit",
      "/solutions/turn-reddit-conversations-into-your-gtm-engine",
    ],
    [
      SHARED_SOURCES.leadly,
      SHARED_SOURCES.princetonGeo,
      SHARED_SOURCES.redditPolicy,
    ],
  ),
  brief(
    "The Agency Guide to Reddit Recommendation Threads",
    "reddit recommendation threads for agencies",
    "Agencies",
    "Agency wants to monitor recommendation requests",
    "Map recommendation threads into a structured agency response workflow.",
    [
      "Why recommendation threads are valuable",
      "What to monitor",
      "What information to gather before replying",
      "How to respond without sounding scripted",
      "How to follow up outside Reddit ethically",
    ],
    [
      "/solutions/scale-your-seo-agency-with-high-intent-reddit-leads",
      "/solutions/scale-your-dev-shop-with-high-intent-reddit-leads",
    ],
    [
      SHARED_SOURCES.leadly,
      SHARED_SOURCES.redditUserAgreement,
      SHARED_SOURCES.ftcEndorsements,
    ],
  ),
  brief(
    "How to Build a Reddit Lead List Without Scraping Spam",
    "build Reddit lead list without spam",
    "Founders and agencies",
    "Searchers want a compliant Reddit lead collection workflow",
    "Teach quality-first lead lists based on public context, manual review, and useful replies.",
    [
      "What makes a lead list useful",
      "What not to collect",
      "How to use public context responsibly",
      "How to prioritize replies",
      "How to keep lead quality high",
    ],
    ["/alternatives/reddit-lead-generation-tools", "/privacy"],
    [
      SHARED_SOURCES.leadly,
      SHARED_SOURCES.redditPolicy,
      SHARED_SOURCES.redditUserAgreement,
    ],
  ),
  brief(
    "Best Reddit Keywords for Finding SaaS Buying Signals",
    "reddit keywords for SaaS buying signals",
    "SaaS founders",
    "Founder wants keyword examples",
    "Give keyword categories without promising exact magic phrases.",
    [
      "Why keyword categories beat single keywords",
      "Alternative and replacement phrases",
      "Pain and frustration phrases",
      "Recommendation phrases",
      "How to pair keywords with ICP filters",
    ],
    [
      "/blog/reddit-keyword-monitoring-vs-intent-based-lead-generation",
      "/solutions/automate-your-customer-acquisition-on-reddit",
    ],
  ),
  brief(
    "Reddit Lead Generation for B2B SaaS: What Works and What Fails",
    "reddit lead generation for B2B SaaS",
    "B2B SaaS teams",
    "Educational commercial investigation",
    "Give a practical, honest breakdown of Reddit as a B2B acquisition channel.",
    [
      "What Reddit is good at",
      "What Reddit is bad at",
      "The signals worth monitoring",
      "How to reply in a useful way",
      "When to graduate to a product workflow",
    ],
    [
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
      "/register",
    ],
  ),
  brief(
    "How to Use Reddit for Competitor Research Without Wasting Hours",
    "use Reddit for competitor research",
    "Founders and product marketers",
    "Buyer wants competitor research tactics",
    "Show how competitor pain and alternative requests can feed positioning and sales.",
    [
      "What competitor research looks like on Reddit",
      "How to find repeat complaints",
      "How to identify switching language",
      "How to turn research into messaging",
      "How Leadly reduces manual scanning",
    ],
    ["/compare/leadly-vs-gummysearch", "/compare/leadly-vs-syften"],
  ),
  brief(
    "Reddit Monitoring for Agencies: From Alerts to Revenue",
    "reddit monitoring for agencies",
    "Marketing, SEO, and dev agencies",
    "Agency compares monitoring tools and workflows",
    "Bridge the gap between raw alerts and qualified opportunities.",
    [
      "Why alerts alone are not enough",
      "How agencies should define fit",
      "What to automate",
      "What humans should review",
      "How to report Reddit-sourced pipeline",
    ],
    [
      "/alternatives/reddit-monitoring-tools-for-agencies",
      "/solutions/scale-your-marketing-consultancy-with-ai-powered-reddit-leads",
    ],
  ),
  brief(
    "How to Reply to Reddit Leads Without Sounding Like a Sales Rep",
    "how to reply to Reddit leads",
    "Founders and agencies",
    "User wants outreach examples and etiquette",
    "Teach useful, context-aware replies that avoid spammy selling.",
    [
      "The Reddit reply rule",
      "What a helpful reply includes",
      "What to avoid",
      "Examples for SaaS and agencies",
      "How to move to DM only when appropriate",
    ],
    [
      "/blog/how-saas-founders-find-customers-on-reddit-without-getting-banned",
      "/register",
    ],
    [
      SHARED_SOURCES.leadly,
      SHARED_SOURCES.redditPolicy,
      SHARED_SOURCES.ftcEndorsements,
    ],
  ),
  brief(
    "How to Turn Reddit Pain Points Into SaaS Positioning",
    "Reddit pain points SaaS positioning",
    "SaaS founders and product marketers",
    "Founder wants messaging research",
    "Show how public pain language can improve landing pages, sales replies, and ICP definitions.",
    [
      "Why Reddit language is useful",
      "How to group pain points",
      "How to identify urgency",
      "How to write positioning from thread evidence",
      "How to keep the loop running",
    ],
    [
      "/solutions/turn-reddit-conversations-into-your-gtm-engine",
      "/dashboard/icps",
    ],
  ),
  brief(
    "Reddit Alternatives Monitoring for Early-Stage SaaS",
    "Reddit alternatives monitoring for SaaS",
    "Early-stage SaaS founders",
    "Founder wants early pipeline and positioning",
    "Explain why alternative monitoring helps tiny teams learn market demand and capture buyers.",
    [
      "Why alternatives are a high-signal query",
      "How to monitor direct and category competitors",
      "How to interpret frustration",
      "How to respond with proof",
      "How to track learnings",
    ],
    ["/compare/leadly-vs-syften", "/alternatives/reddit-lead-generation-tools"],
  ),
  brief(
    "A Practical ICP Framework for Reddit Lead Generation",
    "ICP framework for Reddit lead generation",
    "Founders and GTM teams",
    "User wants to improve lead qualification",
    "Tie ICP clarity to fewer false positives and better Reddit replies.",
    [
      "Why ICP comes before monitoring",
      "The ICP fields that matter",
      "How to define qualifying signals",
      "How to define disqualifying signals",
      "How to improve the ICP over time",
    ],
    [
      "/dashboard/icps",
      "/solutions/turn-reddit-conversations-into-your-gtm-engine",
    ],
  ),
  brief(
    "How to Find Reddit Threads Before Your Competitors Reply",
    "find Reddit threads before competitors",
    "SaaS founders and agencies",
    "Buyer wants timing advantage",
    "Make the case that response timing matters only when paired with relevance.",
    [
      "Why timing matters",
      "Why speed without fit creates spam",
      "How to monitor the right thread types",
      "How to prioritize replies",
      "How to build a daily response habit",
    ],
    ["/register", "/alternatives/reddit-monitoring-tools-for-agencies"],
  ),
  brief(
    "Reddit Lead Generation Metrics That Actually Matter",
    "reddit lead generation metrics",
    "Founders and agency operators",
    "User wants measurement framework",
    "Move beyond impressions and mention volume into actionable pipeline metrics.",
    [
      "The wrong metrics",
      "The metrics worth tracking",
      "How to measure thread quality",
      "How to measure reply outcomes",
      "How to know when to scale",
    ],
    [
      "/dashboard",
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
    ],
  ),
  brief(
    "How to Use Reddit to Validate a SaaS Offer",
    "validate SaaS offer on Reddit",
    "Indie hackers and founders",
    "Founder wants validation before building or scaling",
    "Show offer validation through pain frequency, urgency, and willingness to switch.",
    [
      "What validation means on Reddit",
      "How to find repeated pain",
      "How to spot urgent language",
      "How to test positioning without spamming",
      "How to turn validation into a monitor",
    ],
    [
      "/solutions/automate-your-customer-acquisition-on-reddit",
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
    ],
  ),
  brief(
    "The Best Reddit Lead Sources for Indie Hackers",
    "Reddit lead sources for indie hackers",
    "Indie hackers",
    "Builder wants communities and signal types",
    "Give a clear starting point for indie hackers who need early users.",
    [
      "What indie hackers should avoid",
      "Where early-user signal appears",
      "How to find recommendation threads",
      "How to reply with product context",
      "How to turn learning into a weekly routine",
    ],
    [
      "/solutions/find-your-next-100-users-from-reddit-conversations",
      "/alternatives/reddit-lead-generation-tools",
    ],
  ),
  brief(
    "Reddit Lead Generation for GTM Teams",
    "reddit lead generation for GTM teams",
    "GTM teams",
    "Team wants a cross-functional GTM workflow",
    "Show how Reddit can support sales, marketing, and product with one demand signal loop.",
    [
      "Why GTM teams should care",
      "Signals sales can use",
      "Signals marketing can use",
      "Signals product can use",
      "How to keep ownership clear",
    ],
    [
      "/solutions/turn-reddit-conversations-into-your-gtm-engine",
      "/dashboard/leads",
    ],
  ),
  brief(
    "How to Build a Reddit Monitoring Stack for a Small Agency",
    "reddit monitoring stack for small agency",
    "Small agency operators",
    "Agency wants tooling and process",
    "Explain what belongs in a lightweight stack and what should stay manual.",
    [
      "The stack requirements",
      "Monitoring layer",
      "Qualification layer",
      "Reply and CRM layer",
      "Reporting layer",
    ],
    [
      "/alternatives/reddit-monitoring-tools-for-agencies",
      "/solutions/scale-your-dev-shop-with-high-intent-reddit-leads",
    ],
  ),
  brief(
    "How to Reduce False Positives in Reddit Monitoring",
    "reduce false positives in Reddit monitoring",
    "Teams using keyword alerts",
    "User wants better signal quality",
    "Teach practical filtering and ICP-based qualification.",
    [
      "Why false positives happen",
      "How to tighten keywords",
      "How to add context filters",
      "How ICP scoring helps",
      "When to archive a monitor",
    ],
    [
      "/blog/reddit-keyword-monitoring-vs-intent-based-lead-generation",
      "/compare/leadly-vs-f5bot",
    ],
  ),
  brief(
    "How to Find Founder Communities Talking About Your Category",
    "find founder communities on Reddit",
    "SaaS founders",
    "Founder wants subreddit discovery",
    "Teach category research through community language and adjacent pain.",
    [
      "Start with buyer roles",
      "Search for pain, not product names",
      "Map adjacent communities",
      "Validate signal before scaling",
      "Create monitors from the best communities",
    ],
    [
      "/blog/best-subreddits-for-saas-customer-research-and-demand-capture",
      "/dashboard/monitors",
    ],
  ),
  brief(
    "How to Monitor Reddit for Product-Led Growth Signals",
    "Reddit product-led growth signals",
    "PLG SaaS teams",
    "Team wants PLG research and acquisition signals",
    "Show how product questions, migration pain, and onboarding frustration reveal PLG opportunities.",
    [
      "What PLG signals look like",
      "How to identify onboarding friction",
      "How to catch migration moments",
      "How to reply with product education",
      "How to route insights internally",
    ],
    [
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
      "/blog/what-counts-as-high-intent-on-reddit",
    ],
  ),
  brief(
    "How to Use Reddit for Agency Niche Research",
    "Reddit agency niche research",
    "Agency founders",
    "Agency wants to pick or validate a niche",
    "Show how Reddit demand patterns can guide offer specialization.",
    [
      "Why niche research matters",
      "How to spot recurring client pain",
      "How to compare niche urgency",
      "How to validate willingness to pay",
      "How to turn research into monitors",
    ],
    [
      "/solutions/scale-your-marketing-consultancy-with-ai-powered-reddit-leads",
      "/solutions/scale-your-seo-agency-with-high-intent-reddit-leads",
    ],
  ),
  brief(
    "Reddit Monitoring for Competitor Churn Signals",
    "Reddit competitor churn signals",
    "SaaS sales and marketing teams",
    "Team wants replacement intent opportunities",
    "Explain how public frustration can signal churn risk and switching intent.",
    [
      "What churn signal looks like in public",
      "How to monitor competitor complaint language",
      "How to qualify switching intent",
      "How to reply without attacking competitors",
      "How to feed messaging back to marketing",
    ],
    [
      "/blog/how-to-monitor-competitor-alternatives-on-reddit",
      "/compare/leadly-vs-gummysearch",
    ],
  ),
  brief(
    "How to Create Reddit Monitors That Do Not Flood Your Inbox",
    "create Reddit monitors without noise",
    "Leadly users and evaluation-stage buyers",
    "User wants practical monitor setup guidance",
    "Teach monitor design and maintenance for high-signal queues.",
    [
      "Start with a business outcome",
      "Choose narrow communities",
      "Use keyword sets intentionally",
      "Review and archive weak monitors",
      "Keep a human review loop",
    ],
    ["/dashboard/monitors", "/dashboard/keyword-monitors"],
  ),
  brief(
    "Reddit Lead Generation for SaaS Agencies Serving Founders",
    "reddit lead generation for SaaS agencies",
    "SaaS-focused agencies",
    "Agency wants SaaS-client acquisition",
    "Target agencies selling dev, SEO, growth, or lifecycle services to SaaS founders.",
    [
      "Why SaaS agencies should monitor Reddit",
      "Client pain patterns",
      "Service-specific buying signals",
      "How to respond with expertise",
      "How to operationalize the channel",
    ],
    [
      "/solutions/scale-your-dev-shop-with-high-intent-reddit-leads",
      "/solutions/scale-your-seo-agency-with-high-intent-reddit-leads",
    ],
  ),
  brief(
    "The SaaS Founder Guide to Reddit Customer Research",
    "Reddit customer research for SaaS founders",
    "SaaS founders",
    "Founder wants customer research tactics",
    "Connect research to acquisition, positioning, and product decisions.",
    [
      "What Reddit research can reveal",
      "How to collect useful examples",
      "How to avoid anecdote traps",
      "How to prioritize patterns",
      "How to turn research into pipeline",
    ],
    [
      "/blog/best-subreddits-for-saas-customer-research-and-demand-capture",
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
    ],
  ),
  brief(
    "How to Identify Urgent Pain on Reddit",
    "identify urgent pain on Reddit",
    "Founders, agencies, and sales teams",
    "User wants a signal framework",
    "Show urgency cues that separate casual discussion from near-term need.",
    [
      "What urgency sounds like",
      "Timeline language",
      "Failed solution language",
      "Budget and stakeholder clues",
      "How to prioritize urgent threads",
    ],
    ["/blog/what-counts-as-high-intent-on-reddit", "/dashboard/leads"],
  ),
  brief(
    "How to Use Reddit to Find Users for a New SaaS Product",
    "find users for new SaaS product Reddit",
    "New SaaS founders",
    "Founder wants first users",
    "Give a practical early-user acquisition plan centered on useful participation.",
    [
      "Start with problem communities",
      "Find pain before pitching",
      "Build a first-user monitor",
      "Reply with useful context",
      "Track learning and conversion",
    ],
    [
      "/solutions/find-your-next-100-users-from-reddit-conversations",
      "/register",
    ],
  ),
  brief(
    "How to Find High-Intent Reddit Leads for AI Automation Agencies",
    "Reddit leads for AI automation agencies",
    "AI automation agencies",
    "Agency wants client acquisition from pain threads",
    "Target process bottleneck and automation-help threads without overclaiming AI.",
    [
      "What automation demand sounds like",
      "Communities and phrases to monitor",
      "How to qualify operational pain",
      "How to reply with a workflow diagnosis",
      "How to avoid generic AI pitches",
    ],
    [
      "/solutions/scale-your-marketing-consultancy-with-ai-powered-reddit-leads",
      "/alternatives/reddit-lead-generation-tools",
    ],
  ),
  brief(
    "How to Turn Reddit Threads Into Sales Call Ideas",
    "turn Reddit threads into sales calls",
    "Founder-led sales teams",
    "Founder wants a path from public thread to conversation",
    "Explain a consent-based path from helpful public reply to private conversation.",
    [
      "What has to happen before a sales call",
      "How to make the public reply useful",
      "How to offer next steps",
      "How to log context",
      "How to avoid pushy follow-up",
    ],
    [
      "/blog/how-to-reply-to-reddit-leads-without-sounding-like-a-sales-rep",
      "/register",
    ],
    [
      SHARED_SOURCES.leadly,
      SHARED_SOURCES.redditPolicy,
      SHARED_SOURCES.ftcEndorsements,
    ],
  ),
  brief(
    "Reddit Monitoring Tool Evaluation Checklist",
    "Reddit monitoring tool checklist",
    "Software buyers",
    "Buyer wants comparison criteria",
    "Give a buying checklist for choosing a Reddit monitoring or lead generation product.",
    [
      "The core evaluation criteria",
      "Alert quality",
      "Qualification workflow",
      "Collaboration and export needs",
      "When a simple tool is enough",
    ],
    [
      "/alternatives/reddit-monitoring-tools-for-agencies",
      "/compare/leadly-vs-f5bot",
      "/compare/leadly-vs-syften",
    ],
  ),
  brief(
    "How to Monitor Reddit for Bottom-of-Funnel Keywords",
    "bottom of funnel Reddit keywords",
    "SaaS marketers",
    "User wants BOFU keyword ideas",
    "Explain high-intent keyword patterns and how to avoid irrelevant alerts.",
    [
      "What BOFU looks like on Reddit",
      "Alternative keywords",
      "Pricing and implementation keywords",
      "Recommendation keywords",
      "How to combine keyword and ICP filters",
    ],
    [
      "/blog/best-reddit-keywords-for-finding-saas-buying-signals",
      "/dashboard/keyword-sets",
    ],
  ),
  brief(
    "How to Use Reddit for SaaS Category Creation",
    "Reddit SaaS category creation",
    "Category-creating SaaS founders",
    "Founder wants messaging and education strategy",
    "Show how to find language, objections, and category confusion in public threads.",
    [
      "Why category creation needs public language",
      "How to find confusion",
      "How to identify alternatives buyers already use",
      "How to write educational content from threads",
      "How to monitor category maturity",
    ],
    [
      "/solutions/turn-reddit-conversations-into-your-gtm-engine",
      "/blog/how-to-turn-reddit-pain-points-into-saas-positioning",
    ],
  ),
  brief(
    "How to Build a Reddit-Sourced Content Strategy",
    "Reddit sourced content strategy",
    "Content marketers and founders",
    "User wants SEO and content ideas from Reddit",
    "Connect Reddit research to content briefs, FAQs, comparison pages, and landing pages.",
    [
      "Why Reddit is useful for content research",
      "How to turn threads into article ideas",
      "How to extract FAQ language",
      "How to build comparison content",
      "How to keep content tied to pipeline",
    ],
    ["/blog", "/alternatives/reddit-lead-generation-tools"],
    [
      SHARED_SOURCES.leadly,
      SHARED_SOURCES.googleHelpful,
      SHARED_SOURCES.googleStructuredData,
    ],
  ),
  brief(
    "How to Find Pain-Aware Leads on Reddit",
    "pain aware leads Reddit",
    "Sales teams and founders",
    "User wants signal-stage framework",
    "Explain pain-aware lead identification before people become form-fill leads.",
    [
      "What pain-aware means",
      "How Reddit exposes pain",
      "How to separate pain from curiosity",
      "How to respond with empathy",
      "How to log and route pain-aware leads",
    ],
    ["/blog/how-to-identify-urgent-pain-on-reddit", "/dashboard/leads"],
  ),
  brief(
    "Reddit Lead Generation for Micro SaaS",
    "reddit lead generation for micro SaaS",
    "Micro SaaS founders",
    "Founder wants low-cost acquisition",
    "Show a small, low-overhead workflow for finding and responding to demand.",
    [
      "Why micro SaaS needs focused channels",
      "How to choose niche communities",
      "How to find buying-signal language",
      "How to reply while building trust",
      "How to review results weekly",
    ],
    ["/solutions/automate-your-customer-acquisition-on-reddit", "/register"],
  ),
  brief(
    "How to Monitor Reddit for Startup Problems Worth Solving",
    "startup problems worth solving Reddit",
    "Founders and indie hackers",
    "Builder wants problem discovery",
    "Use Reddit as a problem-discovery source while staying careful about validation quality.",
    [
      "What problem discovery means",
      "How to find repeated pain",
      "How to avoid one-off anecdotes",
      "How to test willingness to switch",
      "How to turn the best problems into monitors",
    ],
    [
      "/solutions/find-your-next-100-users-from-reddit-conversations",
      "/blog/how-to-use-reddit-to-validate-a-saas-offer",
    ],
  ),
  brief(
    "How to Use Reddit to Improve Cold Outreach Timing",
    "Reddit cold outreach timing",
    "B2B founders and sales teams",
    "User wants better timing for outreach",
    "Position Reddit as a timing signal, not a license to spam.",
    [
      "Why timing changes reply quality",
      "How public pain reveals timing",
      "How to avoid invasive outreach",
      "How to reference context responsibly",
      "How to measure reply quality",
    ],
    [
      "/blog/how-to-reply-to-reddit-leads-without-sounding-like-a-sales-rep",
      "/privacy",
    ],
    [
      SHARED_SOURCES.leadly,
      SHARED_SOURCES.redditUserAgreement,
      SHARED_SOURCES.ftcEndorsements,
    ],
  ),
  brief(
    "How to Find Software Buyers on Reddit",
    "find software buyers on Reddit",
    "SaaS sellers and founders",
    "User wants high-level Reddit buyer discovery",
    "Explain the practical signals that reveal active software evaluation.",
    [
      "What software evaluation looks like",
      "Recommendation requests",
      "Alternative requests",
      "Implementation and integration pain",
      "How to respond with relevance",
    ],
    [
      "/alternatives/reddit-lead-generation-tools",
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
    ],
  ),
  brief(
    "How to Build a Reddit Lead Scoring Rubric",
    "Reddit lead scoring rubric",
    "Sales and GTM operators",
    "User wants a scoring template",
    "Provide a rubric teams can adapt for pain, fit, urgency, and reply potential.",
    [
      "Why a rubric helps",
      "Pain score",
      "Fit score",
      "Urgency score",
      "Reply potential score",
    ],
    [
      "/blog/how-to-score-reddit-buying-intent-for-saas-pipeline",
      "/dashboard/leads",
    ],
  ),
  brief(
    "How to Use Reddit to Find Agency Clients in Niche Markets",
    "find agency clients in niche markets Reddit",
    "Niche agencies",
    "Agency wants more precise client acquisition",
    "Explain niche demand capture through communities, keywords, and qualification.",
    [
      "Why niche agencies should monitor differently",
      "How to pick communities",
      "How to define niche pain",
      "How to qualify client fit",
      "How to build a small repeatable process",
    ],
    [
      "/solutions/scale-your-seo-agency-with-high-intent-reddit-leads",
      "/solutions/scale-your-dev-shop-with-high-intent-reddit-leads",
    ],
  ),
  brief(
    "Reddit Lead Generation Mistakes SaaS Teams Make",
    "Reddit lead generation mistakes",
    "SaaS teams",
    "User wants common mistakes and fixes",
    "Warn against spam, broad keywords, poor fit, and weak follow-through.",
    [
      "Monitoring too broadly",
      "Replying too fast without context",
      "Ignoring disqualifying signals",
      "Using generic pitches",
      "Failing to track outcomes",
    ],
    [
      "/blog/reddit-lead-generation-for-b2b-saas-what-works-and-what-fails",
      "/register",
    ],
  ),
  brief(
    "How to Find Competitor Replacement Leads on Reddit",
    "competitor replacement leads Reddit",
    "SaaS founders and agencies",
    "User wants competitor replacement workflow",
    "Give a full workflow for finding and evaluating replacement-intent posts.",
    [
      "What replacement intent looks like",
      "How to monitor competitor names safely",
      "How to qualify urgency",
      "How to reply with comparison proof",
      "How to feed insights to positioning",
    ],
    [
      "/blog/reddit-monitoring-for-competitor-churn-signals",
      "/compare/leadly-vs-syften",
    ],
  ),
  brief(
    "How to Find Reddit Threads That Mention Your Competitors",
    "Reddit competitor mentions",
    "Founders and marketers",
    "User wants competitor mention monitoring",
    "Explain competitor monitoring without turning every mention into a sales pitch.",
    [
      "Why competitor mentions are uneven",
      "Which mentions matter",
      "Which mentions to ignore",
      "How to identify decision-stage context",
      "How to create monitors around competitor language",
    ],
    [
      "/compare/leadly-vs-gummysearch",
      "/blog/how-to-use-reddit-for-competitor-research-without-wasting-hours",
    ],
  ),
  brief(
    "How to Create a Reddit Lead Generation System in One Week",
    "Reddit lead generation system",
    "Founders and small teams",
    "User wants a quick implementation plan",
    "Offer a seven-day setup plan for ICP, monitors, review, replies, and measurement.",
    [
      "Day 1: Define ICP",
      "Day 2: Choose communities",
      "Day 3: Build keyword sets",
      "Day 4: Review historical signal",
      "Day 5: Draft replies",
      "Day 6: Track outcomes",
      "Day 7: Refine monitors",
    ],
    ["/dashboard/icps", "/dashboard/monitors", "/register"],
  ),
  brief(
    "How to Use Reddit for B2B Demand Generation",
    "Reddit B2B demand generation",
    "B2B founders and marketers",
    "User wants a demand generation strategy",
    "Frame Reddit as a demand signal and trust-building channel, not a mass promotion channel.",
    [
      "What demand generation means on Reddit",
      "How to find active problem threads",
      "How to build trust through useful replies",
      "How to turn insights into content",
      "How Leadly fits the workflow",
    ],
    [
      "/solutions/turn-reddit-conversations-into-your-gtm-engine",
      "/blog/how-to-build-a-reddit-sourced-content-strategy",
    ],
  ),
  brief(
    "How to Find Reddit Leads for Productized Services",
    "Reddit leads for productized services",
    "Productized service operators",
    "User wants service lead generation tactics",
    "Show how fixed-scope services can match public pain and recommendation requests.",
    [
      "Why productized services fit Reddit",
      "How to find scope-ready pain",
      "How to avoid custom-consulting traps",
      "How to reply with a clear next step",
      "How to refine the offer from thread patterns",
    ],
    [
      "/solutions/scale-your-marketing-consultancy-with-ai-powered-reddit-leads",
      "/alternatives/reddit-lead-generation-tools",
    ],
  ),
  brief(
    "How to Use Reddit to Find Sales Triggers",
    "Reddit sales triggers",
    "Sales teams and founders",
    "User wants trigger-event monitoring",
    "Explain Reddit-specific triggers such as migration, vendor dissatisfaction, launch pain, and budget urgency.",
    [
      "What a sales trigger is",
      "Reddit-specific trigger types",
      "How to qualify triggers",
      "How to respond without forcing the sale",
      "How to route triggers to the right owner",
    ],
    ["/blog/how-to-identify-urgent-pain-on-reddit", "/dashboard/leads"],
  ),
  brief(
    "How to Monitor Reddit for Buyer Research in SaaS Categories",
    "Reddit buyer research SaaS",
    "SaaS category marketers",
    "User wants buyer research tactics",
    "Teach buyer-language extraction, objection tracking, and comparison insight collection.",
    [
      "What buyer research looks like",
      "How to collect objections",
      "How to find comparison language",
      "How to identify decision criteria",
      "How to turn findings into pages and replies",
    ],
    [
      "/blog/how-to-use-reddit-for-saas-category-creation",
      "/alternatives/reddit-lead-generation-tools",
    ],
  ),
  brief(
    "How to Find Reddit Leads Without Damaging Your Brand",
    "Reddit leads without damaging brand",
    "Founders and agencies",
    "User wants brand-safe Reddit tactics",
    "Give practical rules for respectful monitoring and helpful participation.",
    [
      "Why brand safety matters on Reddit",
      "The helpfulness test",
      "When not to reply",
      "How to disclose affiliation",
      "How to build trust over time",
    ],
    [
      "/blog/how-to-reply-to-reddit-leads-without-sounding-like-a-sales-rep",
      "/terms",
    ],
    [
      SHARED_SOURCES.leadly,
      SHARED_SOURCES.redditPolicy,
      SHARED_SOURCES.ftcEndorsements,
    ],
  ),
  brief(
    "How to Use Reddit Threads to Improve SaaS Landing Pages",
    "Reddit threads improve SaaS landing pages",
    "SaaS founders and marketers",
    "User wants conversion and messaging ideas",
    "Explain how Reddit language can improve headlines, FAQs, objections, and proof sections.",
    [
      "Why Reddit helps landing pages",
      "How to extract headline language",
      "How to build FAQs from objections",
      "How to prioritize proof",
      "How to test changes",
    ],
    [
      "/blog/how-to-turn-reddit-pain-points-into-saas-positioning",
      "/solutions/turn-reddit-discussions-into-your-saas-growth-engine",
    ],
    [
      SHARED_SOURCES.leadly,
      SHARED_SOURCES.googleHelpful,
      SHARED_SOURCES.googleStructuredData,
    ],
  ),
];

const articleSchema = z.object({
  excerpt: z.string(),
  metaDescription: z.string(),
  tags: z.array(z.string()),
  content: z.string(),
});

type ArticlePayload = z.infer<typeof articleSchema>;

function pickImages(slug: string) {
  const hash = Array.from(slug).reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );
  return {
    coverImage: BLOG_STOCK_IMAGES[hash % BLOG_STOCK_IMAGES.length],
    inlineImage1: BLOG_STOCK_IMAGES[(hash + 3) % BLOG_STOCK_IMAGES.length],
    inlineImage2: BLOG_STOCK_IMAGES[(hash + 5) % BLOG_STOCK_IMAGES.length],
  };
}

function formatLinks(paths: string[]) {
  return paths.map((path) => `${SITE_URL}${path}`).join("\n");
}

function formatSources(sources: BulkBlogBrief["sourceUrls"]) {
  return sources.map((source) => `- ${source.label}: ${source.url}`).join("\n");
}

function imageCount(content: string) {
  return (content.match(/!\[[^\]]+\]\(https:\/\/images\.unsplash\.com/g) ?? [])
    .length;
}

function sourceLinkCount(content: string) {
  return (content.match(/\]\(https?:\/\//g) ?? []).length;
}

async function sleep(ms: number) {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureSection(content: string, section: string, fallback: string) {
  return content.includes(section)
    ? content
    : `${content}\n\n${section}\n\n${fallback}`;
}

function normalizeArticle(
  article: ArticlePayload,
  brief: BulkBlogBrief,
): ArticlePayload {
  const images = pickImages(brief.slug);
  let content = article.content
    .replace(/^# .+\n+/m, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!content.startsWith("## Quick Answer")) {
    content = `## Quick Answer\n\n${content}`;
  }

  if (!content.includes(images.inlineImage1)) {
    content = content.replace(
      "## Why This Matters",
      `![Reddit demand workflow](${images.inlineImage1})\n\n## Why This Matters`,
    );
  }

  if (!content.includes(images.inlineImage2)) {
    content = content.replace(
      "## Frequently Asked Questions",
      `![Lead review workflow](${images.inlineImage2})\n\n## Frequently Asked Questions`,
    );
  }

  content = ensureSection(
    content,
    "## Frequently Asked Questions",
    `### How does Leadly help with ${brief.primaryKeyword}?\n\nLeadly helps teams monitor Reddit conversations, score fit against an ICP, and review the threads most likely to deserve a timely reply.\n\n### Should every Reddit mention become a sales reply?\n\nNo. The best workflow filters for pain, timing, fit, and context before deciding whether a reply would actually help.`,
  );

  content = ensureSection(
    content,
    "## Conclusion",
    "Reddit works best as a focused demand-research and response channel, not a place for generic promotion. If you want a cleaner way to find relevant conversations, try Leadly for free.",
  );

  const sourceLines = [
    ...brief.sourceUrls.map((source) => `- [${source.label}](${source.url})`),
    ...brief.internalLinks.map(
      (path) => `- [Related Leadly resource](${SITE_URL}${path})`,
    ),
  ];

  if (!content.includes("## Sources")) {
    content += `\n\n## Sources\n\n${sourceLines.join("\n")}`;
  }

  return {
    ...article,
    excerpt: article.excerpt.slice(0, 190),
    metaDescription:
      article.metaDescription.length > 170
        ? article.metaDescription.slice(0, 167).trimEnd() + "..."
        : article.metaDescription,
    tags: article.tags.slice(0, 8),
    content,
  };
}

function reviewArticle(article: ArticlePayload) {
  const failures = [];
  const content = article.content;

  if (!content.includes("## Quick Answer")) {
    failures.push("missing Quick Answer section");
  }
  if (!content.includes("## Frequently Asked Questions")) {
    failures.push("missing FAQ section");
  }
  if (!content.includes("## Sources")) {
    failures.push("missing Sources section");
  }
  if (/^# /m.test(content)) {
    failures.push("contains H1");
  }
  if (imageCount(content) < 2) {
    failures.push("missing required stock images");
  }
  if (sourceLinkCount(content) < 4) {
    failures.push("too few cited/internal links");
  }
  if (/as an ai|ai-generated|language model/i.test(content)) {
    failures.push("mentions AI generation");
  }
  if (
    /guaranteed (rankings|traffic|revenue|domain rating)|guarantee (rankings|traffic|revenue|domain rating)|hack google|trick google/i.test(
      content,
    )
  ) {
    failures.push("contains overclaiming or manipulative SEO language");
  }
  if (
    article.metaDescription.length < 120 ||
    article.metaDescription.length > 170
  ) {
    failures.push("meta description length is outside range");
  }
  if (article.excerpt.length > 190) {
    failures.push("excerpt too long");
  }

  return failures;
}

async function generateArticle(brief: BulkBlogBrief, attempt: number) {
  const images = pickImages(brief.slug);
  const { object, providerName } = await generateAIObject<ArticlePayload>({
    lite: true,
    temperature: attempt === 1 ? 0.35 : 0.25,
    topP: 0.9,
    schema: articleSchema,
    system:
      "You are Leadly's senior editor. Write original, practical, people-first B2B SaaS content. Do not use filler, fake statistics, or generic AI phrasing.",
    prompt: `Write a publishable Markdown blog article for Leadly.

Title: ${brief.title}
Primary keyword: ${brief.primaryKeyword}
Audience: ${brief.audience}
Search intent: ${brief.searchIntent}
Editorial angle: ${brief.angle}

Required H2 sections to include after the opening:
${brief.sections.map((section) => `- ${section}`).join("\n")}

Internal links to include naturally:
${formatLinks(brief.internalLinks)}

Sources to cite in the Sources section and use only for grounded factual claims:
${formatSources(brief.sourceUrls)}

Stock images to include exactly once each in the body:
- After "## Quick Answer": ![Reddit demand workflow](${images.inlineImage1})
- Before "## Frequently Asked Questions": ![Lead review workflow](${images.inlineImage2})

Rules:
- Return valid JSON matching the schema.
- content must be Markdown only and must not include an H1.
- Start content with "## Quick Answer".
- Include "## Why This Matters", all required sections, "## Frequently Asked Questions", "## Conclusion", and "## Sources".
- Write with concrete examples for SaaS founders, agencies, or GTM teams.
- Keep paragraphs short and specific.
- Aim for 1,200-1,600 words. Do not pad the article.
- Include one Markdown table when it improves clarity.
- Add at least 4 FAQs with direct answers.
- Add a soft CTA to try Leadly for free in the conclusion.
- Do not claim guaranteed rankings, domain rating improvements, or instant revenue.
- Do not mention that the article was generated by AI.
- Do not invent product capabilities beyond Reddit monitoring, keyword monitoring, ICP-style filtering, AI-assisted lead scoring, lead review, generated DMs, schedules, and exports.
- metaDescription should be 140-160 characters when possible.
- excerpt should be concise and under 190 characters.
`,
  });

  return { article: object, providerName };
}

async function main() {
  const requestedCount = Number(process.argv[2] ?? "50");
  const limit = Number.isFinite(requestedCount)
    ? Math.min(requestedCount, BULK_BLOG_BRIEFS.length)
    : 50;

  const existing = await db.blogPost.findMany({
    select: { slug: true },
  });
  const existingSlugs = new Set(existing.map((post) => post.slug));

  const briefs = BULK_BLOG_BRIEFS.filter(
    (item) => !existingSlugs.has(item.slug),
  ).slice(0, limit);

  const created = [];
  const skipped = BULK_BLOG_BRIEFS.length - briefs.length;
  const failures: Array<{ slug: string; failures: string[] }> = [];

  for (const [index, brief] of briefs.entries()) {
    console.log(`[${index + 1}/${briefs.length}] Generating ${brief.slug}`);
    let accepted: ArticlePayload | null = null;
    let providerName = "";
    let lastFailures: string[] = [];

    for (const attempt of [1, 2]) {
      const result = await generateArticle(brief, attempt);
      providerName = result.providerName;
      const normalized = normalizeArticle(result.article, brief);
      const reviewFailures = reviewArticle(normalized);
      if (reviewFailures.length === 0) {
        accepted = normalized;
        break;
      }
      lastFailures = reviewFailures;
      console.warn(
        `Review failed for ${brief.slug} attempt ${attempt}: ${reviewFailures.join(", ")}`,
      );
    }

    if (!accepted) {
      failures.push({ slug: brief.slug, failures: lastFailures });
      continue;
    }

    const { coverImage } = pickImages(brief.slug);
    const post = await db.blogPost.create({
      data: {
        slug: brief.slug,
        title: brief.title,
        excerpt: accepted.excerpt,
        content: accepted.content,
        coverImage,
        authorName: AUTHOR_NAME,
        authorRole: AUTHOR_ROLE,
        authorImage: "",
        tags: accepted.tags,
        metaTitle: brief.title,
        metaDescription: accepted.metaDescription,
        canonicalUrl: `${SITE_URL}/blog/${brief.slug}`,
        publishedAt: new Date(),
        status: "PUBLISHED",
        generationPrompt: `Bulk SEO/GEO brief: ${brief.primaryKeyword}; provider=${providerName}`,
        isAiGenerated: true,
      },
    });

    created.push(post);
    console.log(`Created ${post.slug} via ${providerName}`);

    if (COOLDOWN_MS > 0 && index < briefs.length - 1) {
      console.log(`Cooling down for ${COOLDOWN_MS}ms before next article...`);
      await sleep(COOLDOWN_MS);
    }
  }

  const total = await db.blogPost.count();
  const published = await db.blogPost.count({ where: { status: "PUBLISHED" } });

  console.log(
    JSON.stringify(
      {
        requestedCount: limit,
        created: created.length,
        skippedExistingOrOverLimit: skipped,
        failures,
        total,
        published,
      },
      null,
      2,
    ),
  );

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Bulk SEO blog generation failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
