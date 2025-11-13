# Leadly Platform Context

This repository contains the Leadly lead-monitoring platform. The two active apps are:

- `backend/` – Express 5 + Prisma service that exposes the public API, manages persistence, and schedules scraping work.
- `frontend/` – Next.js 16 App Router UI that consumes the backend API, renders the dashboard, and triggers mutations from the browser.
- `script/` – currently unused for this documentation pass (left as-is per request).

The sections below summarise architecture, design decisions, API behaviour, and operational considerations for both apps.

---

## Backend (`backend/`)

### Stack & entry points
- Node 20+ with Express 5 (`src/index.ts`) powering `/api/v1`.
- Prisma ORM (`prisma/schema.prisma`) backed by PostgreSQL.
- BullMQ + Redis queue (`src/lib/queue.ts`) with a dedicated worker (`src/workers/reddit.worker.ts`).
- Node-cron scheduler (`runScheduler` in `src/services/scheduler.ts`) running every 30 minutes.
- Google Gemini 2.5 Flash via `@ai-sdk/google` for lead scoring (`src/processors/ai.processor.ts`).
- Playwright-driven Nitter scraper is scaffolded in `src/services/nitterScrape.ts` (not wired into the main flow yet).

### Module map
- `src/routes/` hold Express routers grouped by resource (auth, account, icps, monitors, schedule, leads, scrape jobs).
- `src/controllers/` contain request handlers with schema validation (Zod in `src/types/*`).
- `src/services/` bundle external integrations (Reddit API wrapper, scheduler).
- `src/processors/` handle asynchronous work (Reddit scrape + AI enrichment).
- `src/middleware/auth.ts` verifies session cookies via Prisma and decorates `req.userId`.
- `src/lib/` exports Prisma singleton, BullMQ queue, constants, prompts, and helpers.
- `src/workers/reddit.worker.ts` consumer process that executes queued scrape jobs.

### Data model essentials
Entities (see `prisma/schema.prisma`):
- `User` with soft-delete flag (`isDeleted`) and one-to-one `Subscription`, `UserSchedule`.
- `Icp` (name, summary, target persona, pain points, value proposition, qualifying/disqualifying signals, and platform) belongs to a user.
- `Monitor` (e.g., subreddit) belongs to an ICP and user, tracks cursor + status.
- `ScrapeJob` stores execution status, warm/cold/neutral counts, timestamps.
- `Lead` references a `ScrapeJob`, holds AI-evaluated reasoning and type.
- `Session` persists login state and backs the HTTP-only `session_token` cookie.
- `Subscription` encodes tier (`FREE`, `PRO`, `PREMIUM`) and limit metadata.

### Background processing pipeline
1. `runScheduler` (cron `*/30 * * * *`) locates users whose schedule contains the current hour, verifies an active subscription, and enqueues BullMQ `scrapeJobs` per active monitor.
2. `src/workers/reddit.worker.ts` listens to the `scrapeJobs` queue and invokes `processScrapeJob`.
3. `processScrapeJob`:
   - Pulls Reddit posts/comments using OAuth 2.0 client credentials (`Reddit` class).
   - Cleans content (`cleanText`) and calls the Gemini prompt (`leadGenerationPrompt`) per post.
   - Persists new leads, updates job status + warm/cold/neutral counts, and advances the monitor cursor within a single Prisma transaction.
4. Failures update the job to `FAILED` with an error message.

### Environment variables
Defined in `src/env.ts` (all required unless noted):
`PORT`, `DATABASE_URL`, `SESSION_SECRET`, `FRONTEND_URL`, `NITTER_URL`,
`REDIS_URL` (default `redis://localhost:6380`), `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME` (default handle).

### Running the backend locally
1. `pnpm install`
2. Provision Postgres + Redis (see `docker-compose.yml` for Redis example).
3. Populate `.env` with the variables above.
4. `pnpm prisma:migrate` then `pnpm dev` to start the API; run the worker separately with `pnpm worker`.

> The scheduler runs inside the API process. Stop the server gracefully to shut down cron and queue connections (handlers registered in `src/index.ts`).

### API surface (current behaviour)
All routes live under `/api/v1`. Controllers respond with raw JSON objects (no consistent `{message, payload}` envelope unless noted).

| Method & Path | Summary | Notable details / differences vs `API_REFERENCE.md` |
|---------------|---------|-----------------------------------------------------|
| `POST /auth/register` (`/auth/login`, `/auth/logout`) | Email/password auth issuing `session_token` cookie. | Registration always seeds an `ACTIVE` `FREE` subscription good for 1 year. Session rows omit `ipAddress`/`userAgent`, so `GET /account/sessions` currently returns `null` for those fields. |
| `GET /account` / `PATCH /account` / `DELETE /account` | Fetch/update/soft-delete current user. | Responses are plain objects (`{ message, payload }`) per code; deleting simply toggles `isDeleted`. |
| `GET /account/sessions` | List active sessions for the user. | Returns array of session rows. Since session creation omits metadata, `ipAddress`/`userAgent` are `null` despite examples in the original spec. |
| `POST /icps` | Create an ICP briefing (name, summary, persona, pains, value proposition, qualifying/disqualifying signals, platform). | Returns the persisted ICP with `userId`. |
| `GET /icps` & `GET /icps/:id` | List ICPs with nested monitors and scrape jobs. | No `take` limit is applied, so *all* related `scrapeJobs` are returned (spec claimed “10 most recent”). |
| `PATCH /icps/:id` / `DELETE /icps/:id` | Update or remove an ICP. | Delete blocks if monitors still exist (error message updated). |
| `POST /monitors` | Create monitor under an ICP. | Enforces subscription tier limits via `TIER_LIMITS`. Errors include friendly tier copy. |
| `GET /monitors` | List monitors with parent ICP and last 10 jobs. | `scrapeJobs` include all aggregation fields; limited via `take: 10`. |
| `PUT /monitors/:id` / `DELETE /monitors/:id` | Update or remove a monitor. | Standard responses. |
| `GET /schedule` | Fetch schedule, auto-creates default `[12]` entry if missing. | Returns the `UserSchedule` record directly, not `{ message, payload }` as shown in the old doc. |
| `PATCH /schedule` | Update scheduled hours (validates uniqueness, range, tier limit). | Returns the upserted schedule object. Follows tier defaults when creating a new record (`DEFAULT_HOURS_MAP`). |
| `GET /schedule/limits` | Return subscription tier + limits + current schedule (if any). | Matches spec; 400 if subscription missing. |
| `GET /leads` | Paginated lead list with filters. | Response matches `{ message, payload: { data, pagination } }`. |
| `GET /leads/:id` | Lead detail with reasoning. | Response matches spec. |
| `PATCH /leads/:id` | Update lead status. | Returns `{ message, payload: { id, status } }`. |
| `DELETE /leads/:id` | Delete a lead. | Returns `{ message, payload: {} }`. |
| `GET /monitors/:monitorId/jobs` | Paginated job history for a monitor. | Adds `leadCount` field calculated on the fly. |

### Corrections vs the original `API_REFERENCE.md`
- Scheduler cadence is every **30 minutes** (`*/30 * * * *`), not hourly.
- `GET /icps` presently returns **all** scrape jobs; limit to 10 is not enforced.
- Scrape jobs no longer populate the `metadata` field (`{ after: ... }` in the doc is outdated).
- `GET /schedule` and `PATCH /schedule` return the raw schedule object (no `message` wrapper); same for most controller responses.
- `DEFAULT_HOURS_MAP.PREMIUM` includes `24`, which falls outside the documented `0–23` range (bug worth fixing; validation currently catches hours > 23).
- Session records leave `ipAddress`/`userAgent` empty unless upstream logic populates them later.
- Registration seeds a default subscription (not mentioned previously).

### Operational notes & gotchas
- The worker process **must** run alongside the API to process BullMQ jobs; otherwise `scrapeJobs` remain `PENDING`.
- Prisma client is stored on `global` to avoid re-instantiation during hot reloads.
- Ensure `FRONTEND_URL` matches the actual UI origin; CORS is locked to that value.
- `NITTER_URL` is required even if Nitter scraping isn’t currently invoked.

---

## Frontend (`frontend/`)

### Stack & global setup
- Next.js 16 App Router (React 19) with TypeScript and Tailwind CSS v4.
- `src/app/layout.tsx` wraps the tree in a `QueryProvider` (TanStack Query) to coordinate client mutations.
- Styling uses Tailwind CSS with custom design tokens defined in `src/app/globals.css`.
- Config & metadata live in `src/config/site.ts`, `components.json`, and `next.config.ts`.

### Directory highlights
- `src/app/` – App Router routes. Auth pages live in `(auth)`, dashboard in `(dashboard)`. Static policy pages under `/privacy` and `/terms`.
- `src/lib/backend-queries.ts` – server-side helpers that fetch from the backend during SSR, automatically forwarding the `session_token` cookie using `backendJson`.
- `src/lib/client/api.ts` – browser-facing client for mutations (`fetch` with `credentials: "include"`), hitting the backend API directly.
- `src/components/` – feature-specific UI (auth forms, dashboards, tables, ICP forms) + shared UI primitives (`ui/`).
- `src/types/backend.ts` – TypeScript mirror of backend responses (used in both server queries & client API layer).

### Data flow & session handling
1. **Server-rendered reads** use `backend-queries` inside server components (e.g., dashboard layout). Each helper calls `backendFetch`, which:
   - Resolves the backend base URL (`BACKEND_URL`/`NEXT_PUBLIC_BACKEND_URL`, default `http://localhost:3001`).
   - Pulls the `session_token` cookie from Next’s `cookies()` store and forwards it to the backend.
   - Throws a typed `BackendError` for non-2xx responses (callers catch 401s to redirect to `/login`).
2. **Client-side mutations** use `clientApi` within React Query hooks. These calls go straight to the backend (`${backendUrl}/api/v1/...`) and rely on the browser carrying the `session_token` cookie (CORS requires matching `FRONTEND_URL` on the backend).
3. Auth pages (`/login`, `/register`) are server components that call `getAccountSummary`; if a valid session exists they immediately `redirect("/dashboard")`, preventing already signed-in users from seeing auth forms.

### Key design decisions
- **Auth gate in layout:** `src/app/(dashboard)/layout.tsx` fetches the account summary on the server. Missing/401 responses trigger `redirect("/login")`, ensuring all dashboard routes stay private without client-side guards.
- **React Query for UX:** Mutations (`useMutation`) handle optimistic UI, error toasts, and router refresh (e.g., ICP creation refreshes the dashboard data).
- **API typing:** `src/types/backend.ts` mirrors backend responses; any divergence (e.g., session metadata being `null`) shows up at compile time.
- **Styling system:** Tailwind CSS v4 with `tw-animate-css` for animations and custom CSS variables for theming. Components enforce consistent spacing (`Card`, `Badge`, etc.).
- **Routing:** App Router segments allow separate auth & dashboard layouts, keeping bundle sizes focused.
- **Dashboard shell:** `src/components/dashboard/shell.tsx` owns the responsive chrome. The sidebar is sticky on desktop so plan/tips cards stay anchored, while mobile uses an overlay drawer that reuses the same nav structure.
- **Design-ready dashboard cards:** The refreshed overview surface uses modular stat/spotlight components (`dashboard/stat-card.tsx`) with trend badges to keep KPI styling consistent.
- **Design mode fixtures:** Setting `NEXT_PUBLIC_DESIGN_MODE=1` renders an in-memory dataset for the dashboard, skips backend fetches in server components, and keeps the layout testable without API dependencies.
- **Dialog + confirmations:** `src/components/ui/dialog.tsx` plus `ui/confirm-dialog.tsx` provide a shadcn-style modal system used for the lead detail view and destructive flows (ICPs, monitors, accounts), replacing browser alerts with consistent UI. Edit dialogs for ICPs/monitors reuse the same primitives.
- **ICP + monitor management:** Users can now edit ICP briefs and reassign monitors between ICPs inline; backend `DELETE /icps/:id` cascades through monitors, jobs, and leads for a clean removal.

### Environment & scripts
- `.env.local` expects `BACKEND_URL` or `NEXT_PUBLIC_BACKEND_URL` pointing to the backend base (e.g., `http://localhost:3001`). This value should *not* include `/api/v1`; the code appends that path internally.
- Optional: `NEXT_PUBLIC_DESIGN_MODE=1` seeds rich mock data for the dashboard UI while you iterate on layout/visuals (real API calls resume when the flag is unset).
- Scripts (`package.json`): `pnpm dev`, `pnpm build`, `pnpm start`.
- Tailwind/PostCSS configs already set up for Next.js 16 (no additional wiring required).

### Known gaps / observations
- All client mutations assume the backend sets/reads `session_token` via cookies; there is no token fallback.
- React Query is initialised with retry = 0 for mutations and 1 for queries; adjust if backend stability changes.
- UI currently targets a single platform (`REDDIT`). Dropdowns hard-code this option.

---

## End-to-end flow summary
1. **Signup/Login** – User registers via `/auth/register` (backend seeds a `FREE` subscription) or logs in. The backend issues the `session_token` cookie directly; server components pick it up through `cookies()` on the next request.
2. **ICP setup** – User creates a detailed ICP briefing. Response includes the ICP ID.
3. **Monitor creation** – User adds monitors (subreddits). Tier limits enforced server-side.
4. **Scheduling** – User adjusts scrape hours (validated against tier). Defaults to `[12]` on first access.
5. **Scheduler + Worker** – Every 30 minutes the scheduler enqueues jobs for monitors tied to schedules matching the current hour. The worker fetches Reddit content, calls Gemini to score leads, and writes `Lead` records.
6. **Dashboard consumption** – Server components fetch ICPs, monitors, schedule, leads via `backend-queries`; client widgets use React Query to mutate and refetch.
7. **Lead management** – Users filter leads, mark status, or delete entries from the UI, which maps to the `/leads` endpoints.

---

## Open questions & potential follow-ups
1. **`DEFAULT_HOURS_MAP.PREMIUM` uses hour `24`:** Validation rejects it, but correcting the constant will avoid accidental defaults.
2. **Session metadata:** If ip/user-agent auditing is desired, populate `ipAddress` and `userAgent` when creating sessions.
3. **`GET /icps` volume:** Consider reinstating the “last 10 jobs” limit (e.g., `take: 10`) to keep payload sizes manageable.
4. **Nitter integration:** `scrapeNitter` is implemented but not scheduled—decide whether to wire it into the queue or remove until needed.
5. **ICP authoring UX:** Consider richer guidance (e.g., templates or markdown preview) so users provide consistent, high-quality signals.

This README is intended as the canonical context file for future LLM assistance—update it alongside significant pipeline or API changes.
