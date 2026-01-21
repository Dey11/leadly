# Leadly Platform Context

This repository contains the Leadly lead-monitoring platform. The two active apps are:

- `backend/` – Express 5 + Prisma service that exposes the public API, manages persistence, schedules scraping work, and handles billing webhooks.
- `frontend/` – Next.js 16 App Router UI that consumes the backend API, renders the dashboard, manages subscriptions, and triggers mutations from the browser.

The sections below summarise architecture, design decisions, API behaviour, and operational considerations for both apps.

---

## Backend (`backend/`)

### Stack & entry points

- **Runtime:** Node 20+ with Express 5 (`src/index.ts`) powering `/api/v1`.
- **Database:** Prisma ORM (`prisma/schema.prisma`) backed by PostgreSQL.
- **Queue & Cache:** BullMQ + Redis (`src/lib/queue.ts`, `src/lib/redis.ts`) for job queues and webhook idempotency.
- **Worker:** Dedicated worker process (`src/workers/reddit.worker.ts`) for scraping tasks.
- **Scheduler:** Node-cron (`src/services/scheduler.ts`) running every 30 minutes.
- **AI:** Google Gemini 2.5 Flash via `@ai-sdk/google` for lead scoring and enrichment (`src/processors/ai.processor.ts`).
- **Billing:** Dodo Payments integration via `dodopayments` SDK and `standardwebhooks` for secure webhook verification.
- **Scraping:** Reddit API client (OAuth2) + scaffolding for Playwright-driven Nitter scraping (currently inactive).

### Module map

- `src/routes/` hold Express routers grouped by resource:
  - `auth`, `account`, `icps`, `monitors`, `schedule`, `leads`, `scrape-jobs`
  - `billing` (Dodo Payments checkout & portal sessions)
  - `webhooks` (Dodo event handling)
- `src/controllers/` contain request handlers, including the raw-body webhook handler (`webhooks.ts`).
- `src/services/` bundle external integrations (Reddit API wrapper, scheduler).
- `src/processors/` handle asynchronous work (Reddit scrape + AI enrichment).
- `src/middleware/auth.ts` verifies session cookies via Prisma and decorates `req.userId`.
- `src/lib/` exports Prisma singleton, Redis client, BullMQ queue, Dodo client, constants, and helpers.
- `src/workers/reddit.worker.ts` consumer process that executes queued scrape jobs.

### Data model essentials

Entities (see `prisma/schema.prisma`):

- `User`: Core identity, soft-deletable (`isDeleted`).
- `Subscription`: One-to-one with User. Tracks status (`ACTIVE`, `PAST_DUE`, etc.), tier (`FREE`, `PRO`, `PREMIUM`), current period end, and Dodo `subscriptionCustomerId`.
- `Icp`: Ideal Customer Profile (name, persona, pains, signals) belonging to a user.
- `Monitor`: Watchlist (e.g., subreddit) belonging to an ICP. Tracks scraping cursor.
- `ScrapeJob`: Execution record for a monitor. Stores `warm`/`cold`/`neutral` counts.
- `Lead`: Individual result referencing a `ScrapeJob`. Contains content, AI reasoning, and status.
- `Session`: Persists login state for `session_token` cookie.
- `UserSchedule`: Defines when the scheduler should queue jobs for a user.

### Background processing pipeline

1. **Scheduler** (`cron */30 * * * *`):
   - Locates users with `UserSchedule` matching the current hour.
   - Verifies active subscription (status `ACTIVE`).
   - Enqueues `scrapeJobs` in BullMQ for every active monitor owned by these users.
2. **Worker** (`src/workers/reddit.worker.ts`):
   - Consumes `scrapeJobs`.
   - Fetches posts from Reddit via OAuth2 client.
   - Cleans text and invokes Gemini 2.5 Flash to score leads against the parent ICP.
   - Persists `Lead` records, updates `ScrapeJob` stats, and advances `Monitor` cursor in a transaction.
3. **Webhooks** (Dodo Payments):
   - Listens for `subscription.*` events.
   - Verifies signature using `standardwebhooks`.
   - Uses Redis (`dodo:webhooks:<id>`) for idempotency.
   - Updates `Subscription` status/tier and resets usage limits (`initializeOrResetUsagePeriod`) on renewal or plan change.

### Environment variables

Defined in `src/env.ts` and `.env`. All are required unless noted:

**Core & Auth**

- `PORT` (default 3000)
- `DATABASE_URL` (Postgres connection string)
- `REDIS_URL` (default `redis://localhost:6380`)
- `SESSION_SECRET` (for cookie signing)
- `FRONTEND_URL` (CORS origin)
- `BACKEND_URL` (Self-reference for callbacks)

**AI & Scraping**

- `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini API key)
- `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`
- `NITTER_URL` (Required structure, even if unused)

**Billing (Dodo Payments)**

- `DODO_API_KEY` (Live/Test key)
- `DODO_ENVIRONMENT` (`test_mode` or `live_mode`)
- `DODO_WEBHOOK_SECRET` (from Dodo dashboard)
- `DODO_PRO_PRODUCT_ID` (Product ID for Pro plan)
- `DODO_PREMIUM_PRODUCT_ID` (Product ID for Premium plan)

### Running the backend locally

1. `pnpm install`
2. Provision Postgres + Redis (ensure Redis is running for detailed job/webhook handling).
3. Populate `.env` with all variables above.
4. `pnpm prisma:migrate` to setup DB.
5. **Start API:** `pnpm dev` (runs Express app + Scheduler).
6. **Start Worker:** `pnpm worker` (runs BullMQ processor).

> **Note:** The scheduler runs inside the API process, but the actual scraping happens in the worker process. Both must be running.

### API surface

All routes live under `/api/v1`.

**Auth & Account**
| Method & Path | Summary |
|---------------|---------|
| `POST /auth/register` | Register user, seeds `FREE` `ACTIVE` subscription. |
| `POST /auth/login` | Login, issues `session_token`. |
| `POST /auth/logout` | Logout, clears cookie. |
| `GET /account` | Get profile. |
| `PATCH /account` | Update profile details. |
| `DELETE /account` | Soft-delete user. |
| `GET /account/sessions` | List active sessions. |

**Resources**
| Method & Path | Summary | Notes |
|---------------|---------|-------|
| `GET /icps` | List ICPs + Monitors + Jobs. | Returns all jobs (no parsing limit yet). |
| `POST /icps` | Create ICP. | |
| `PATCH/DELETE /icps/:id`| Update/Delete ICP. | Delete cascades to monitors/leads. |
| `GET /monitors` | List Monitors. | Includes 10 most recent jobs. |
| `POST /monitors` | Create Monitor. | Enforces `TIER_LIMITS`. |
| `GET /schedule` | Get Schedule. | Auto-creates default if missing. |
| `PATCH /schedule` | Update Schedule. | Validates hours vs Tier. |
| `GET /leads` | List Leads. | Paginated, supports filtering. |
| `GET /leads/:id` | Get Lead details. | |

**Billing**
| Method & Path | Summary | Notes |
|---------------|---------|-------|
| `POST /billing/subscribe` | Create Checkout Session. | Body: `{ plan: "pro" \| "premium" }`. Returns `{ url }`. |
| `POST /billing/portal/manage` | Get Customer Portal URL. | Returns `{ url }`. |
| `POST /billing/portal/cancel` | Get Cancel Subscription URL. | Returns `{ url }`. |
| `POST /webhooks/dodo` | Handle Dodo events. | Raw body handler. Verifies signature. |

---

## Frontend (`frontend/`)

### Stack & global setup

- **Framework:** Next.js 16 App Router (React 19).
- **Styling:** Tailwind CSS v4, `tw-animate-css`, `shadcn`-compatible components in `src/components/ui`.
- **State:** TanStack Query (`@tanstack/react-query`) for server state management.
- **Icons:** `lucide-react`.

### Directory highlights

- `src/app/` – App Router structure:
  - `(auth)`: Login/Register layouts.
  - `(dashboard)`: Authenticated app shell, includes `billing` pages.
  - `api/`: Next.js internal API routes (if any used, mostly pure client-to-backend fetch).
- `src/lib/backend-queries.ts` – Server-side Data Fetching. Uses `cookies()` to forward `session_token`.
- `src/lib/client/api.ts` – Client-side Data Mutation. Uses browser cookies via `credentials: "include"`.
- `src/components/` – Feature components (`dashboard`, `icp`, `billing`) and UI primitives.
- `src/types/backend.ts` – TypeScript definitions matching Backend API responses.

### Data flow & session handling

1. **Server-rendered reads:**
   - Components use helpers in `backend-queries.ts`.
   - Helpers resolve `BACKEND_URL` and forward the `session_token` cookie.
   - Failures (401) trigger redirects to `/login`.
2. **Client-side mutations:**
   - React Query hooks use `clientApi`.
   - Requests hit `NEXT_PUBLIC_BACKEND_URL` directly.
   - Browser handles cookie transmission automatically.
   - Optimistic updates or invalidation triggers UI refreshes.

### Key design decisions

- **Auth Gate:** `src/app/(dashboard)/layout.tsx` validates session on server entry.
- **Design Mode:** `NEXT_PUBLIC_DESIGN_MODE=1` enables mock data for UI development without a running backend.
- **Billing Flow:**
  - User selects plan -> `mutate` calls `/billing/subscribe`.
  - Redirects to Dodo Checkout -> User pays.
  - Redirects back to `/billing/result` (Frontend) while Dodo webhooks (Backend) provision the subscription.
  - UI typically polls or relies on React Query invalidation to reflect "PRO" status.

### Environment & scripts

- `.env.local`: `NEXT_PUBLIC_BACKEND_URL` (e.g., `http://localhost:3000`).
- `pnpm dev`: Start dev server.
- `pnpm build`: Build production bundle.

### Known gaps / observations

- **Client Logic:** Assumes `session_token` is always cookie-managed.
- **Platform Support:** UI hardcodes `REDDIT` options, though backend `Platform` enum is extensible.
- **Billing Sync:** There's a slight race condition between user returning to the app and the webhook processing. The UI may need a refresh to gaze the new "PRO" badge immediately if the webhook is slow.

---

## End-to-end flow summary

1. **Signup:** User registers. Backend creates `User` & `Subscription` (FREE).
2. **Subscription:** User upgrades to PRO. Backend generates Dodo link. User pays. Webhook fires -> Backend updates `Subscription` to PRO + resets usage limits.
3. **Setup:** User creates ICP (persona) and Monitors (subreddits).
4. **Scheduling:** User sets scrape hours (e.g., 9 AM, 5 PM).
5. **Collection:**
   - `scheduler` wakes up at top of hour x:00 or x:30.
   - Finds matching users.
   - Pushes jobs to BullMQ.
   - `worker` processes jobs: Scrapes Reddit -> Gemini AI Analysis -> Save Leads.
6. **Consumption:** User logs in. Dashboard shows fresh leads. User qualifies/disqualifies them.

## Operational notes

- **Webhooks:** Critical for billing. If Redis is down, idempotent checks fail (or pass through depending on config), but mainly `REDIS_URL` is vital.
- **CORS:** `FRONTEND_URL` in Backend `.env` must match the actual browser origin of the Frontend.
- **Worker:** Must be running to process any scrapes.
- **Nitter:** The codebase contains a Nitter scraper structure (`src/services/nitterScrape.ts`) but it is not currently wired into the main `processScrapeJob` flow.
