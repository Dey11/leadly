# SEO and GEO System

## Overview

Leadly's public acquisition surface now focuses on two audiences:

- SaaS founders
- agencies and adjacent service teams

The SEO/GEO system is built from four layers:

1. focused marketing pages on the frontend
2. comparison and alternatives pages for commercial intent
3. database-backed blog content generated from curated briefs
4. machine-readable discovery assets for search engines and AI assistants

## Site-Level SEO and GEO

### Global metadata

Defined in:

- `frontend/src/app/layout.tsx`
- `frontend/src/constants/seo.ts`
- `frontend/src/config/site.ts`

Current setup includes:

- canonical metadata base
- founder and agency focused default title/description
- Open Graph defaults
- Twitter card defaults
- updated keyword set centered on Reddit lead generation

### Structured data

Defined through:

- `frontend/src/lib/structured-data.ts`
- `frontend/src/app/page.tsx`
- route-level page files

Current schema coverage:

- homepage:
  - `SoftwareApplication`
  - `Organization`
  - `Product`
- blog posts:
  - `Article`
  - `BreadcrumbList`
  - `FAQPage` when FAQs exist
- solution pages:
  - `BreadcrumbList`
  - `FAQPage`
- comparison and alternatives pages:
  - `BreadcrumbList`
  - `FAQPage`
  - `SoftwareApplication`

### Robots and sitemap

Defined in:

- `frontend/src/app/robots.ts`
- `frontend/src/app/sitemap.ts`

Current rules:

- public marketing pages are indexable
- dashboard and API routes are blocked
- sitemap is exposed
- sitemap fetches up to 1,000 published database-backed blog posts so larger blog libraries remain discoverable
- explicit AI crawler allow rules exist for:
  - `GPTBot`
  - `ChatGPT-User`
  - `ClaudeBot`
  - `anthropic-ai`
  - `PerplexityBot`
  - `Bingbot`
  - `Googlebot`

### LLM discovery assets

Defined in:

- `frontend/src/app/llms.txt/route.ts`
- `frontend/src/app/llms-full.txt/route.ts`

These routes provide:

- product summary
- audience definition
- workflow explanation
- feature descriptions
- pricing summary
- canonical comparison pages
- canonical solution pages
- canonical blog resources

## Homepage Positioning

The homepage has been rewritten to move away from broad “monitor everything” messaging and toward:

- finding high-intent Reddit buying signals
- helping founders and agencies catch alternative, recommendation, and problem threads
- turning discussions into pipeline faster than competitors

Updated marketing sections include:

- hero
- feature explanation
- use cases
- FAQ
- footer CTA
- trust and safety messaging
- competitor/comparison section

Public-facing “coming soon” messaging has been removed from the main landing experience.

## Solutions Landing Pages

Primary route:

- `frontend/src/app/(marketing)/solutions/[slug]/page.tsx`

Primary data source:

- `frontend/src/data/solutions.json`

The solutions set is intentionally focused on high-intent acquisition segments instead of broad thin-page generation. Current pages target:

- SaaS Founders
- SEO Agencies
- Marketing Consultants
- Dev Shops
- GTM Teams
- Indie Hackers
- AI Automation Agencies
- B2B Sales Teams
- Productized Services
- Product Marketers

Each page now includes:

- role-specific pain points
- why Reddit matters for that audience
- role-specific value propositions
- tailored FAQ entries
- canonical metadata
- breadcrumb and FAQ schema

This reduces thin page risk and keeps the indexable footprint aligned with the product wedge while adding landing pages for commercially relevant segments that can become paying users.

## Comparison and Alternatives Pages

Primary data source:

- `frontend/src/data/commercial-pages.ts`

Reusable template:

- `frontend/src/components/landing/CommercialPage.tsx`

Routes:

- `/compare/leadly-vs-syften`
- `/compare/leadly-vs-f5bot`
- `/compare/leadly-vs-gummysearch`
- `/alternatives/reddit-lead-generation-tools`
- `/alternatives/reddit-monitoring-tools-for-agencies`

Each page includes:

- query-specific metadata
- comparison tables
- best-fit framing
- limitations and strengths
- FAQ content
- breadcrumb/schema support

These pages are designed for bottom-funnel and decision-stage intent.

## Blog Engine

Primary implementation:

- `backend/src/seo/blog.processor.ts`
- `backend/src/seo/topics.ts`
- `backend/src/workers/blog.worker.ts`
- `backend/src/routes/blog.ts`

### Content model

The blog system no longer relies on generic random topics. It now uses a curated brief set with:

- title
- primary keyword
- audience
- editorial angle
- outline
- internal links
- cited sources

Current briefs focus on:

- Reddit lead generation tools
- comparison content
- founder and agency use cases
- high-intent signal frameworks
- competitor-alternative monitoring

### Generation flow

1. select the next unused curated brief
2. generate a structured plan
3. generate long-form Markdown content
4. generate metadata and tags
5. store the post in PostgreSQL

### Publishing model

The worker now maintains a scheduled backlog instead of publishing random posts immediately.

Behavior:

- publish any due scheduled drafts
- keep a target queue of future `DRAFT` posts
- schedule posts at spaced intervals
- avoid exposing future posts publicly until `publishedAt <= now`

Supporting scripts:

- `backend/src/scripts/manual-generate-blog.ts`
- `backend/src/scripts/generate-blog-backlog.ts`
- `backend/src/scripts/bulk-generate-seo-blogs.ts`

For campaign batches, run the bulk script from `backend/` with an explicit
count:

```bash
bun run blog:bulk-seo 50
```

The bulk script is intentionally separate from the daily worker. It uses curated
commercial briefs, existing low-cost app AI providers with Nebius excluded,
stock images from the controlled image pool, and a local editorial review pass
before a post is inserted.

### Blog route behavior

The blog API now only exposes posts that are:

- `PUBLISHED`
- and already due based on `publishedAt`

This prevents scheduled drafts from leaking into public pages or the sitemap before they should be visible.

## Images

The content engine still uses a controlled stock-image pool for blog covers and inline visuals.

Current priority order for future improvement is:

1. product screenshots
2. original diagrams and comparison visuals
3. lightweight custom illustrations
4. stock images as fallback

Frontend assets were not swapped as part of this pass.

## Measurement and Operations

Implementation-ready but external/manual steps still required:

- verify Google Search Console
- verify Bing Webmaster Tools
- submit sitemap after deploy
- monitor impressions and clicks by:
  - homepage
  - solutions pages
  - comparison pages
  - blog posts

Operational guidance:

- do not expand solutions pages until the narrowed set proves traction
- do not resume generic daily AI content generation
- use the curated brief backlog model
- keep internal links tight between homepage, solutions, comparisons, and blogs

## SEO-Relevant Files

- `frontend/src/app/page.tsx`
- `frontend/src/app/robots.ts`
- `frontend/src/app/sitemap.ts`
- `frontend/src/app/llms.txt/route.ts`
- `frontend/src/app/llms-full.txt/route.ts`
- `frontend/src/app/(marketing)/blog/page.tsx`
- `frontend/src/app/(marketing)/blog/[slug]/page.tsx`
- `frontend/src/app/(marketing)/solutions/[slug]/page.tsx`
- `frontend/src/app/(marketing)/compare/[slug]/page.tsx`
- `frontend/src/app/(marketing)/alternatives/[slug]/page.tsx`
- `frontend/src/components/landing/CommercialPage.tsx`
- `frontend/src/constants/seo.ts`
- `frontend/src/data/solutions.json`
- `frontend/src/data/commercial-pages.ts`
- `frontend/src/lib/structured-data.ts`
- `backend/src/seo/blog.processor.ts`
- `backend/src/seo/topics.ts`
- `backend/src/workers/blog.worker.ts`
- `backend/src/routes/blog.ts`
- `backend/src/scripts/manual-generate-blog.ts`
- `backend/src/scripts/generate-blog-backlog.ts`
