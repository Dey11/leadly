# Leadly: AI-Powered Reddit Lead Generation Platform

> **Turn Reddit Conversations into Revenue.**  
> Automated monitoring, AI qualification, and high-intent lead discovery for B2B sales teams.

Leadly is a sophisticated intelligence engine designed to cut through the noise of social media. Instead of manually scrolling through subreddits or relying on basic keyword alerts, Leadly uses **DeepSeek V4 Flash through Nebius Token Factory** to semantically analyze conversations, determining not just _what_ is being said, but the _intent_ behind it.

This repository contains the complete source code for the Leadly platform, comprising a Next.js 16 frontend and an Express 5 backend.

---

##  Table of Contents

- [Project Overview & Core Value](#-project-overview--core-value)
- [Key Features](#-key-features)
- [Technical Architecture](#-technical-architecture)
- [Project Structure](#-project-structure)
- [Data Model & Database](#-data-model--database)
- [The Monitoring Engine](#-the-monitoring-engine)
- [Billing & Subscriptions](#-billing--subscriptions)
- [Deployment & Workflows](#-deployment--workflows)
- [Admin & Operations](#-admin--operations)
- [Development Setup](#-development-setup)
- [Environment Variables](#-environment-variables)

---

##  Project Overview & Core Value

Leadly addresses a critical problem in modern B2B sales: **finding customers where they hang out without wasting hours on manual research.**

Reddit is a goldmine for user feedback, pain points, and product recommendations, but it is vast and unstructured. Leadly acts as a 24/7 autonomous sales development representative (SDR) that:

1.  **Monitors Communities**: Watches specific subreddits relevant to your niche (e.g., r/SaaS, r/marketing).
2.  **Filters by Keyword**: Tracks specific terms like "competitor alternative", "how to fix", or "recommendation".
3.  **Qualifies with AI**: Uses LLMs to read the post context. It filters out noise (memes, low-effort posts) and scores leads based on how well they match your **Ideal Customer Profile (ICP)**.
4.  **Enriches Data**: Extracts sentiment, author intent, and creates a summary of _why_ this lead is valuable.

### Why Leadly? (Promo Context)

- **Precision > Volume**: Unlike traditional social listening tools that spam you with every mention, Leadly's AI scoring ensures you only see high-intent leads (e.g., matching a score of >75/100).
- **Set & Forget**: Define your ICP once. Leadly runs on a scheduled cron job (hourly/daily) to deliver fresh leads.
- **Dual-Engine Monitoring**:
  - **Interest Monitoring**: "Watch these 5 subreddits for anyone complaining about X."
  - **Keyword Monitoring**: "Find anyone on ALL of Reddit saying 'best CRM for startups'."

---

##  Key Features

### 1. Smart Monitors

- **Subreddit Targeting**: Validates subreddit existence via Reddit API before adding.
- **Keyword Sets**: Create bundles of keywords (e.g., "Buying Intent" set: `buy`, `price`, `cost`, `alternative`).
- **Fuzzy Matching**: Optional logic to match related terms.

### 2. AI Lead Scoring & Analysis

- **Relevance Score**: 0-100 score indicating how well a post matches the user's ICP.
- **Sentiment Analysis**: Detects Frustration, Curiosity, Satisfaction.
- **Persona Matching**: Identifies if the poster is a likely buyer (e.g., "Founder", "Developer") vs. a student or hobbyist.
- **AI Cold DM Builder**: Generates personalized, human-like DMs based on the lead's post and your unique writing style.
  - **Context Aware**: Uses your company details and role.
  - **Style Mimicry**: Learns from your previous DMs to match your tone.
  - **Smart Links**: Automatically inserts your portfolio/proof-of-work links exactly where needed.
  - **One-Click Send**: Pre-fills the Reddit compose window with your AI-generated message.

### 3. Scheduling & Quotas

- **Custom Active Hours**: Users define when they want scrapes to run (e.g., 9 AM - 5 PM).
- **Tier-Based Limits**:
  - **Free**: 30 scrapes/mo, 1 daily slot.
  - **Pro**: 180 scrapes/mo, 6 daily slots.
  - **Premium**: 720 scrapes/mo, hourly 24/7 coverage.

### 4. Enterprise-Grade Billing

- **Dodo Payments Integration**: Seamless checkout and subscription management.
- **Automated Provisioning**: Webhooks handle upgrades, downgrades, and cancellations instantly.
- **Usage Tracking**: Monthly and daily quotas enforced at the API level.

### 5. User Onboarding & Personalization

- **Smart Onboarding**: Multi-step modal flow to capture user context, role, and writing style.
- **Unified Settings**: Centralized profile, billing, and account management at `/dashboard/settings`.
- **Persistent Profile**: Stores company details and "Sample DM" to ensure AI consistency across sessions.

---

## Technical Architecture

Leadly is built as a monorepo with two primary applications:

### 1. Backend (`/backend`)

- **Framework**: Express 5 (Node.js 20+).
- **Language**: TypeScript.
- **Database**: PostgreSQL (via NeonDB) managed by **Prisma ORM 7**.
- **Queue System**: **BullMQ** on **Redis** for asynchronous scraping jobs.
- **Worker**: Dedicated worker process for heavy lifting (Reddit scraping + AI processing).
- **Worker**: Dedicated worker process for heavy lifting (Reddit scraping + AI processing).
- **AI Stack**:
  - **Nebius DeepSeek V4 Flash** is the first-choice model for qualification, suggestions, outreach, and content generation.
  - **Google Gemini** is the active automatic fallback. Cerebras and WaveSpeed
    remain configured but disabled until their production accounts are usable.

### 2. Frontend (`/frontend`)

- **Framework**: Next.js 16 (App Router).
- **UI Library**: React 19, Tailwind CSS v4, ShadCN UI.
- **State Management**: TanStack Query (Server State).
- **Authentication**: Custom JWT-based auth with secure HTTP-only cookies.

---

##  Project Structure

```bash
/
├── backend/
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── controllers/    # Route handlers (Auth, Monitors, Leads)
│   │   ├── lib/            # Shared utilities (Redis, Queue, Dodo, AI)
│   │   ├── middleware/     # Auth checks, Rate limits
│   │   ├── processors/     # Job logic (The "Brain" of scraping)
│   │   ├── routes/         # API endpoint definitions
│   │   ├── services/       # External APIs (Reddit, Scheduler)
│   │   ├── workers/        # BullMQ worker entry point
│   │   └── env.ts          # Zod-validated environment config
│   └── index.ts            # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   │   ├── (auth)/     # Login/Register pages
│   │   │   └── (dashboard)/# Main app interface
│   │   ├── components/     # Reusable UI (Button, Input, Sidebar)
│   │   ├── lib/            # Client-side API wrappers & utils
│   │   └── hooks/          # React hooks
```

---

##  Data Model & Database

The core entities driving Leadly are defined in `prisma/schema.prisma`.

### Core Entities

- **`User`**: The account holder. Links to `Subscription` and `Usage`.
- **`Icp` (Ideal Customer Profile)**: Defines "Who we are looking for" (Persona, Pains, Signals).
- **`Monitor`**: A specific subreddit watch-job linked to an ICP.
- **`KeywordSet` & `KeywordMonitor`**: Separate entities for global keyword tracking.
- **`ScrapeJob`**: A record of a single execution of a monitor.
- **`ScrapeJob`**: A record of a single execution of a monitor.
- **`Lead`**: The final output. A relevant Reddit post with AI analysis and stored `generatedDm`.

---

## ⚙️ The Monitoring Engine

The heart of Leadly is the scraping pipeline.

1.  **Scheduler (`cron`)**:
    - Runs every hour (backend service).
    - Checks active users' schedules (`UserSchedule`).
    - If the current hour matches the user's schedule (and they have quota), a job is added to the **BullMQ Queue**.

2.  **Worker (`reddit.worker.ts`)**:
    - Picks up the job.
    - **Fetch**: Calls Reddit API (or Nitter fallback) to get recent posts from the target subreddit.
    - **Filter**: Discards posts already seen or outside criteria.
    - **Analyze**: Sends post content + ICP definition through the shared Nebius-first AI provider chain.
      - _Prompt Strategy_: "You are a sales expert. Does this post matches this ICP? Rate 0-100."
    - **Save**: If Score > Threshold (e.g. 75), saves as a `Lead` in Postgres.

3.  **Optimization**:
    - **Cursor-based Pagination**: Stores the last seen Reddit post ID (`after`) to avoid re-scanning old posts.
    - **Rate Limiting**: Respects Reddit API limits.

---

##  Billing & Subscriptions

We use **Dodo Payments** as the merchant of record.

- **Tiers** (defined in `constants.ts`):
  - `FREE`: Entry level.
  - `PRO`: Power user ($9/mo).
  - `PREMIUM`: Agency level ($24/mo).
- **Webhooks**:
  - Endpoint: `/api/v1/webhooks/dodo`
  - Events: `subscription.created`, `subscription.cancelled`, `failed`.
  - **Idempotency**: Redis keys (`dodo:webhooks:<id>`) prevent duplicate processing.

---

##  Deployment & Workflows

Leadly is designed for modern CI/CD pipelines, specifically tailored for **Coolify**.

### Deployments

- **Coolify GitHub App**: Zero-config deployment.
- **Production**: Triggered by push to `master`.
- **Production frontend**: `https://leadly.tryhanabi.com`.
- **Production API**: `https://api.leadly.tryhanabi.com`.
- **Proxy**: Uses Coolify's internal proxy (Traefik) for SSL and routing.
- **Database migrations**: The backend container runs `prisma migrate deploy` on startup inside Coolify's private network before starting the API.

### CI Pipeline (GitHub Actions)

Located in `.github/workflows/ci.yml`.

1.  **Backend**: `bun run lint`, `typecheck`, `build`.
2.  **Frontend**: `bun run build`.
3.  **Database**: Uses a dummy connection string for `prisma generate` during build to ensure type safety without a live DB connection.

---

##  Admin & Operations

### Logs & Monitoring

Leadly implements a robust logging strategy using **Winston**.

- **Automatic hourly logs**:
  - **Backend**: Sends `combined.log` and `error.log` to Discord at `xx:00` UTC.
  - **Worker**: Sends worker logs to Discord at `xx:30` UTC.
- **Manual Trigger**:
  - **Endpoint**: `POST /api/v1/admin/logs/discord`
  - **Auth**: Requires header `X-Admin-API-Key: <ADMIN_API_KEY>`
  - **Response**: JSON confirmation of files sent.
- **Monitor duplicate diagnostics**:
  - **Endpoint**: `POST /api/v1/admin/monitors/diagnostics`
  - **Body**: `{ "email": "account@example.com" }`
  - **Auth**: Requires header `X-Admin-API-Key: <ADMIN_API_KEY>`
- **Monitor duplicate repair**:
  - **Endpoint**: `POST /api/v1/admin/monitors/dedupe`
  - **Preview body**: `{ "email": "account@example.com", "dryRun": true }`
  - **Apply body**: `{ "email": "account@example.com", "dryRun": false, "confirmAccountId": "..." }`
  - Preserves unique monitors, leads, and scrape history while removing copied
    `merged_*` monitor/ICP records. Apply requests are rejected while recent
    scrape jobs may still be active.
  - **Auth**: Requires header `X-Admin-API-Key: <ADMIN_API_KEY>`
- **Stale monitor job recovery**:
  - **Endpoint**: `POST /api/v1/admin/monitors/jobs/recover`
  - Uses the same dry-run, account confirmation flow and also requires
    `confirmJobIds` to exactly match the preview before replacing stale jobs.
  - **Auth**: Requires header `X-Admin-API-Key: <ADMIN_API_KEY>`
- **Failed monitor job retry**:
  - **Endpoint**: `POST /api/v1/admin/monitors/jobs/retry-failed`
  - Previews the latest failed job for each monitor without an active job;
    applying requires the inspected account and exact job IDs, then enqueues
    one fresh retry per monitor.
  - **Auth**: Requires header `X-Admin-API-Key: <ADMIN_API_KEY>`

### Admin API Key

Set `ADMIN_API_KEY` in your `.env` (min 32 chars).
Generate one via: `openssl rand -hex 32`

---

##  Development Setup

### Prerequisites

- Node.js 20+ (or Bun)
- Docker (for Redis/Postgres) or local instances
- Nebius Token Factory API key
- Google AI Studio Key (fallback)
- Reddit App Credentials

### Quick Start

1.  **Clone & Install**

    ```bash
    git clone <repo>
    cd backend && npm install
    cd ../frontend && npm install
    ```

2.  **Environment Config**
    - Copy `.env.example` to `.env` in both folders.
    - Fill in `DATABASE_URL`, `REDIS_URL`, `GOOGLE_GENERATIVE_AI_API_KEY`, etc.

3.  **Database Setup**

    ```bash
    cd backend
    npm run prisma:migrate # Applies schema to DB
    npm run seed           # Optional: Seeds initial data
    ```

4.  **Run Locally**
    - **Term 1 (Backend)**: `npm run dev`
    - **Term 2 (Worker)**: `npm run worker:dev`
    - **Term 3 (Frontend)**: `npm run dev`

---

##  Environment Variables

Complete reference for `.env` configuration.

| Variable                           | Description                           |
| :--------------------------------- | :------------------------------------ |
| `DATABASE_URL`                     | PostgreSQL Connection String (NeonDB) |
| `REDIS_URL`                        | Redis Connection String               |
| `SESSION_SECRET`                   | Secret for signing session cookies    |
| `FRONTEND_URL`                     | URL of the frontend (for CORS)        |
| `COOKIE_DOMAIN`                    | Optional shared session cookie domain |
| `EMAIL_FROM`                       | Verified default Resend sender        |
| `SECURITY_EMAIL_FROM`              | Verified security-email sender        |
| `NEBIUS_API_KEY`                   | Nebius Token Factory API key          |
| `GOOGLE_GENERATIVE_AI_API_KEY`     | Gemini fallback API key               |
| `GOOGLE_CLIENT_ID`                 | Google OAuth Client ID                |
| `GOOGLE_CLIENT_SECRET`             | Google OAuth Client Secret            |
| `GOOGLE_REDIRECT_URI`              | Google OAuth callback URL             |
| `GOOGLE_OAUTH_ENABLED`             | Enables backend Google OAuth routes   |
| `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` | Shows Google sign-in in the frontend  |
| `REDDIT_CLIENT_ID`                 | Reddit App ID                         |
| `REDDIT_CLIENT_SECRET`             | Reddit App Secret                     |
| `REDDIT_USERNAME`                  | Reddit Account Username               |
| `DODO_API_KEY`                     | Dodo Payments API Key                 |
| `DODO_WEBHOOK_SECRET`              | Dodo Webhook verification secret      |
| `DISCORD_LOGS_WEBHOOK_URL`         | /Optional/ Webhook for system logs    |
| `ADMIN_API_KEY`                    | /Optional/ Key for admin endpoints    |
