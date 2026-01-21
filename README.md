# Leadly Platform Context

This repository contains the Leadly lead-monitoring platform. The two active apps are:

- `backend/` – Express 5 + Prisma service that exposes the public API, manages persistence, schedules scraping work, and handles billing webhooks.
- `frontend/` – Next.js 16 App Router UI that consumes the backend API, renders the dashboard, manages subscriptions, and triggers mutations from the browser.

The sections below summarise architecture, design decisions, API behaviour, and operational considerations for both apps.

---

## Backend (`backend/`)

### Stack & entry points

- **Runtime:** Node 20+ with Express 5 (`src/index.ts`) powering `/api/v1`.
- **Database:** Prisma ORM 7 (`prisma/schema.prisma`) backed by PostgreSQL (NeonDB).
- **Queue & Cache:** BullMQ + Redis (`src/lib/queue.ts`, `src/lib/redis.ts`) for job queues and webhook idempotency.
- **Worker:** Dedicated worker process (`src/workers/reddit.worker.ts`) for scraping tasks.
- **Scheduler:** Node-cron (`src/services/scheduler.ts`) running hourly/half-hourly.
- **AI:** Google Gemini 2.5 Flash via `@ai-sdk/google` for lead scoring and enrichment (`src/processors/ai.processor.ts`).
- **Billing:** Dodo Payments integration via `dodopayments` SDK and `standardwebhooks`.
- **Scraping:** Reddit API client (OAuth2) + scaffolding for Playwright-driven Nitter scraping.

### Module map

- `src/routes/` hold Express routers grouped by resource:
  - `auth`, `account`, `icps`, `monitors`, `schedule`, `leads`, `scrape-jobs` (Interest Monitoring)
  - `keyword-set`, `keyword-monitor`, `keyword-lead` (Keyword Monitoring)
  - `billing` (Dodo Payments checkout & portal sessions)
  - `webhooks` (Dodo event handling)
- `src/controllers/` contain request handlers.
- `src/services/` bundle external integrations (Reddit API wrapper, scheduler, logger).
- `src/processors/` handle asynchronous work (Reddit scrape + AI enrichment).
- `src/middleware/auth.ts` verifies session cookies via Prisma and decorates `req.userId`.
- `src/lib/` exports Prisma singleton, Redis client, BullMQ queue, Dodo client, constants, and helpers.
- `src/workers/reddit.worker.ts` consumer process that executes queued scrape jobs.

### Data model essentials

Entities (see `prisma/schema.prisma`):

- **User & Auth**: `User`, `Session`, `Subscription` (Free/Pro/Premium).
- **Interest Monitoring** (Subreddit-based):
  - `Icp`: Ideal Customer Profile (persona, pains).
  - `Monitor`: Watchlist (subreddits) belonging to an ICP.
  - `ScrapeJob`: Execution record for a monitor.
  - `Lead`: Individual result referencing a job.
- **Keyword Monitoring** (Search-based):
  - `KeywordSet`: Bundle of keywords to track.
  - `KeywordMonitor`: Settings for the monitoring task.
  - `KeywordLead`: Leads generated from keyword searches.

### Background processing pipeline

1. **Scheduler** (`cron`):
   - **Interest Scrapes:** Users with `UserSchedule` matching the current hour.
   - **Keyword Scrapes:** Periodically checks active keyword monitors.
   - Enqueues jobs in BullMQ.
2. **Worker** (`src/workers/reddit.worker.ts`):
   - Consumes jobs.
   - **Interest Scrapes:** Fetches posts from Reddit subreddits -> AI Analysis -> score against ICP -> Save `Lead`.
   - **Keyword Scrapes:** Searches Reddit for keywords -> AI Analysis -> Save `KeywordLead`.
3. **Webhooks** (Dodo Payments):
   - Listens for `subscription.*` events.
   - Updates status/tier and resets usage limits.
   - Uses Redis (`dodo:webhooks:<id>`) for idempotency.

### Environment variables

Defined in `src/env.ts` and `.env`. Key variables:

- **Core:** `DATABASE_URL` (NeonDB), `REDIS_URL`, `SESSION_SECRET`
- **AI/Scraping:** `GOOGLE_GENERATIVE_AI_API_KEY`, `REDDIT_CLIENT_ID/SECRET`
- **Billing:** `DODO_API_KEY`, `DODO_WEBHOOK_SECRET`
- **Logging:** `DISCORD_LOGS_WEBHOOK_URL` (for hourly logs)

---

## Frontend (`frontend/`)

### Stack & global setup

- **Framework:** Next.js 16 App Router (React 19).
- **Styling:** Tailwind CSS v4, `tw-animate-css`, `shadcn`-compatible components.
- **State:** TanStack Query (`@tanstack/react-query`) for server state management.
- **Icons:** `lucide-react`.

### Directory highlights

- `src/app/` – App Router structure:
  - `(auth)`: Login/Register layouts.
  - `(dashboard)`: Authenticated app shell, includes `billing` pages.
- `src/lib/backend-queries.ts` – Server-side Data Fetching.
- `src/lib/client/api.ts` – Client-side Data Mutation.
- `src/components/` – Feature components and UI primitives.

### Design decisions

- **Auth Gate:** `src/app/(dashboard)/layout.tsx` validates session on server entry.
- **Billing Flow:** Redirects to Dodo Checkout -> Webhook provisions subscription.
- **Design Mode:** `NEXT_PUBLIC_DESIGN_MODE=1` enables mock data for UI dev.

---

## Deployment & Content Delivery

The application is deployed on **Coolify** (Self-hosted PaaS).

### Deployments (Coolify GitHub App)

- **Production:** Pushing to `master` triggers an automatic deployment via Coolify's GitHub App integration.
- **Preview:** Opening a Pull Request creates a temporary preview environment using dynamic proxy routing.
- **Zero Configuration:** No manual Docker webhooks needed.

### Logs & Monitoring

- **Hourly Logs:** Both Backend and Worker processes send log files to a Discord channel every hour (via `DISCORD_LOGS_WEBHOOK_URL`).
- **Admin API:** `POST /api/v1/admin/logs/discord` to manually trigger log uploads.

---

## Operational notes

- **Webhooks:** Critical for billing.
- **CORS:** `FRONTEND_URL` in Backend `.env` must match the browser origin.
- **Updates:** Database migrations run automatically on startup (`prisma migrate deploy`).
