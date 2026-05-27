# Backend Documentation

## Stack

- Runtime: Bun
- Framework: Express 5
- Language: TypeScript
- ORM: Prisma 7
- Database: PostgreSQL
- Queue: BullMQ
- Cache and rate limiting: Redis via ioredis
- AI: Google Gemini through both `@google/generative-ai` and Vercel AI SDK packages
- Billing: Dodo Payments
- Email: Resend
- OAuth: Google OAuth
- Logging: Winston plus Discord webhook delivery

## Entry Point

Backend startup lives in `backend/src/index.ts`.

It is responsible for:

- creating the Express app
- applying CORS and cookie parsing
- mounting `/api/v1` routes
- registering the raw-body Dodo webhook route before JSON parsing
- exposing `/health`
- starting the hourly lead scheduler
- starting the half-hour keyword scheduler
- starting hourly log shipping
- handling graceful shutdown for HTTP, Redis, and Prisma

## API Base

- Base path: `/api/v1`
- Auth model: HTTP-only `session_token` cookie

## Route Groups

### Auth

Mounted at `/api/v1/auth`

- `POST /register`
- `POST /login`
- `POST /logout`
- `POST /verify-email`
- `POST /resend-verification-email`
- `POST /forgot-password`
- `POST /reset-password`
- `GET /google`
- `GET /google/callback`

### Account

Mounted at `/api/v1/account`

- `GET /`
- `PATCH /`
- `PATCH /profile`
- `PATCH /walkthrough`
- `DELETE /`
- `GET /sessions`
- `GET /usage`

### ICP Lead Generation

Mounted at:

- `/api/v1/icps`
- `/api/v1/monitors`
- `/api/v1/leads`
- `/api/v1/schedule`

Endpoints include:

- ICP CRUD
- AI-assisted ICP suggestion
- monitor CRUD
- AI subreddit suggestions for monitors
- schedule read/update
- schedule limit lookup
- lead list/detail/update/delete/export
- DM generation for a lead
- monitor scrape-job history

### Keyword Monitoring

Mounted at:

- `/api/v1/keyword-sets`
- `/api/v1/keyword-monitors`
- `/api/v1/keyword-leads`
- `/api/v1/keyword-schedule`
- `/api/v1/keyword-stats`

Endpoints include:

- keyword set CRUD
- keyword monitor CRUD
- AI subreddit suggestions for keyword monitors
- keyword schedule create/read/update
- keyword lead list/detail/update/delete/export
- keyword monitoring statistics

### Billing

Mounted at `/api/v1/billing`

- `POST /subscribe`
- `POST /preview-plan-change`
- `POST /portal/manage`
- `POST /portal/cancel`

Webhook:

- `POST /api/v1/webhooks/dodo`

### Content

Mounted at `/api/v1/blog`

- `GET /posts`
- `GET /posts/:slug`

### Operations

- `POST /api/v1/admin/logs/discord`
- `POST /api/v1/bug-reports`
- `GET /api/v1/bug-reports`

## Auth and Session Model

Auth uses a database-backed session table.

Key behavior:

- requests authenticate through the `session_token` cookie
- middleware loads the session and attached user from the database
- deleted users have their sessions cleaned up
- expired sessions are rejected
- write, delete, billing, and AI-sensitive routes often require verified email

There are two auth middleware variants:

- `authMiddleware`: authenticated access, verified or unverified
- `authMiddlewareVerifiedOnly`: blocks unverified users with a specific error code

## Rate Limiting

Redis-backed rate limiting exists at two levels.

### Public/auth limits

Examples:

- registration
- login
- verify email
- forgot/reset password
- resend OTP

### Authenticated per-user limits

Buckets:

- `read`
- `write`
- `delete`
- `ai`
- `billing`

Development mode bypasses rate limiting.

## Scheduling and Processing

### Lead-generation scheduler

Implemented in `backend/src/services/scheduler.ts`.

Responsibilities:

- recover stuck pending jobs
- reschedule failed jobs when retry windows open
- check users whose `UserSchedule.scheduledHours` includes the current UTC hour
- enforce billing limits via usage helpers
- create `ScrapeJob` rows
- enqueue jobs to BullMQ

### Keyword scheduler

Implemented in `backend/src/services/keyword-scheduler.ts`.

Responsibilities:

- recover stuck keyword jobs
- retry failed keyword jobs
- check users whose `KeywordSchedule.scheduledHours` includes the current UTC hour
- enforce keyword usage limits
- create `KeywordScrapeJob` rows
- process jobs inline

### Worker

Implemented in `backend/src/workers/reddit.worker.ts`.

Responsibilities:

- consume BullMQ `scrapeJobs`
- run Reddit scrape processing with concurrency 10
- ship logs on a cron
- start the blog worker cron

## Data Model

Core tables and their roles:

- `User`: account, onboarding fields, profile fields, verification state
- `Session`: persistent session storage
- `Subscription`: plan, state, Dodo identifiers
- `Usage`: monthly and daily usage counters for both lead-gen and keyword monitoring
- `Icp`: ideal customer profile definition
- `Monitor`: subreddit monitor attached to an ICP
- `ScrapeJob`: execution record for lead-generation runs
- `Lead`: saved AI-qualified lead from a scrape job
- `FailedScrapeJob`: lead-gen failure archive
- `KeywordSet`: reusable keyword bundle
- `KeywordMonitor`: subreddit monitor attached to a keyword set
- `KeywordScrapeJob`: execution record for keyword runs
- `KeywordLead`: saved keyword match
- `FailedKeywordScrapeJob`: keyword failure archive
- `UserSchedule`: lead-gen schedule by UTC hour list
- `KeywordSchedule`: keyword schedule by UTC hour list
- `WebhookEvent`: Dodo webhook processing record
- `Account`: OAuth-linked external identity
- `BugReport`: in-app issue capture
- `BlogPost`: database-backed blog content and SEO metadata

## Environment Variables

Validated in `backend/src/env.ts`.

Main categories:

- core runtime: `PORT`, `NODE_ENV`, `DATABASE_URL`, `SESSION_SECRET`, `FRONTEND_URL`
- infrastructure: `REDIS_URL`
- scraping: `NITTER_URL`, Reddit API credentials
- billing: Dodo API keys, product ids, webhook secret
- email: `RESEND_API_KEY`
- AI: `GOOGLE_GENERATIVE_AI_API_KEY`
- logging and ops: Discord webhook URLs, `ADMIN_API_KEY`
- OAuth: Google client credentials and redirect URI
- feature flags: `FEATURE_BILLING_ENFORCEMENT`

## Deployment Notes

The backend image:

- installs dependencies with Bun
- runs `prisma generate`
- builds server and worker entrypoints with `bun build`
- ships the compiled `dist/` output
- runs `prisma migrate deploy` from the backend container before starting the API, unless `RUN_MIGRATIONS=false`

Production compose deploys:

- API service
- worker service
- frontend service

Redis is expected as a separate dependency and PostgreSQL is externalized via `DATABASE_URL`.

### Production migrations on Coolify

Schema changes should be created in development and deployed in production:

1. Create migrations against a local or development database with `bun run prisma:migrate`.
2. Commit the generated files under `backend/prisma/migrations/`.
3. Deploy to Coolify.
4. The backend container runs `bunx prisma migrate deploy` inside Coolify's private network before the API starts.

Do not run `prisma migrate dev` or `prisma db push` against the production database. The worker waits for the backend healthcheck, so migration application happens before background processing starts.

## Current Backend Practices

- route/controller separation is used consistently
- infrastructure helpers live under `src/lib`
- long-running work is pushed out of request-response handlers
- environment is validated at boot with Zod
- verified-only mutations are enforced in middleware
- usage controls are enforced centrally, not only in the UI
