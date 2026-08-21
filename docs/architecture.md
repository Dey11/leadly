# Leadly Architecture

## System Overview

Leadly is a monorepo split into two deployable applications and one worker process:

- `frontend/`: public marketing site, auth flows, dashboard UI
- `backend/`: REST API, auth/session handling, billing, scraping orchestration, content APIs
- `leadly_worker`: asynchronous job worker for queued lead-generation scrapes and scheduled blog generation

At runtime, the system depends on:

- PostgreSQL for durable application data
- Redis for rate limiting, queue transport, and operational coordination
- BullMQ for queued lead-generation scrape jobs
- External APIs for Reddit, Nebius Token Factory, Google Gemini and other AI fallbacks, Dodo Payments, Resend, and Google OAuth

## Runtime Topology

### Frontend

- Built with Next.js 16 App Router
- Deployed as a standalone Next server
- Reads backend data through server-side fetch helpers that forward the `session_token` cookie
- Generates `robots.txt` and `sitemap.xml` inside the app

### Backend

- Built with Express 5 and TypeScript
- Exposes versioned APIs under `/api/v1`
- Uses Prisma with PostgreSQL
- Owns auth, account state, billing, monitor CRUD, schedule management, lead retrieval, blog APIs, and admin operations

### Worker

- BullMQ worker listens on the `scrapeJobs` queue
- Processes ICP-based Reddit scrape jobs concurrently
- Also starts a daily blog cron inside the worker process

## Product Modes

Leadly currently has two parallel monitoring systems.

### 1. ICP Lead Generation

Used when the user wants AI-qualified leads.

Flow:

1. User defines an ICP
2. User attaches one or more subreddit monitors to that ICP
3. Backend scheduler checks user schedules hourly
4. Scheduler enforces subscription usage limits
5. Eligible monitors create `ScrapeJob` records
6. Jobs are pushed to BullMQ
7. Worker scrapes Reddit, runs AI qualification, and saves `Lead` records

### 2. Keyword Monitoring

Used when the user wants keyword matches and mention tracking.

Flow:

1. User creates keyword sets
2. User creates keyword monitors targeting subreddits
3. Keyword scheduler runs hourly at minute 30
4. Scheduler enforces keyword usage limits
5. `KeywordScrapeJob` records are created
6. Keyword processing runs immediately in-process without BullMQ
7. Matching content is saved as `KeywordLead`

## Scheduling Model

There are three cron-driven operational loops in the backend stack:

- Lead generation scheduler: hourly
- Keyword scheduler: hourly at minute 30
- Log delivery to Discord: hourly from backend and hourly from worker at an offset

There is also a daily blog generation cron started from the worker process:

- Blog generation: every day at `00:00 UTC`

## Queueing Model

Only ICP lead-generation jobs currently use BullMQ.

- Queue name: `scrapeJobs`
- Job payload: `monitorId`, `jobId`
- Worker concurrency: `10`

Keyword monitoring does not currently use BullMQ. Its scheduler creates a job row and processes it inline.

## Failure Handling

The backend includes retry and stuck-job recovery behavior:

- Failed scrape jobs can be retried until `MAX_SCRAPE_RETRY_COUNT`
- Pending jobs older than the configured stuck threshold are reprocessed
- Separate failed-job tables exist for lead-gen and keyword monitoring
- Health endpoint validates both database and Redis connectivity

Free-tier automation also has an account-level inactivity gate:

- authenticated product activity updates `User.lastActiveAt` with an hourly write throttle
- after three inactive days, schedulers stop creating or retrying jobs and pending/running jobs are marked `CANCELLED`
- processors recheck the gate before execution so queued jobs cannot bypass it
- processor completion and failure writes are conditional, so a cancellation cannot be overwritten by late results or retry handling
- returning users must explicitly re-enable future jobs from the dashboard banner
- Pro and Premium accounts are exempt

An independent administrative pause gate applies to every subscription tier.
It takes precedence over inactivity policy, participates in the same scheduler
and processor write-boundary checks, and is cleared only by the explicit
account re-enable action.

## Deployment Shape

The root `docker-compose.yml` defines three services:

- `leadly_backend`
- `leadly_worker`
- `leadly_frontend`

There is also a backend-local compose file for Redis:

- `backend/docker-compose.yml`

This matches a production topology where frontend, API, worker, Redis, and PostgreSQL are separate concerns.

## Data Ownership

### Backend owns

- Authentication and sessions
- User profile and onboarding state
- Billing and usage enforcement
- ICPs, monitors, schedules, leads
- Keyword sets, keyword monitors, keyword leads
- Blog post storage and retrieval

### Frontend owns

- Marketing presentation
- Dashboard rendering
- Route-level metadata and sitemap/robots generation
- Static solutions dataset in `frontend/src/data/solutions.json`

## Code Structure

### Backend structure

- `src/index.ts`: API server bootstrap and cron registration
- `src/routes/`: endpoint wiring
- `src/controllers/`: request handlers
- `src/services/`: schedulers and external service orchestration
- `src/processors/`: scrape-processing logic
- `src/workers/`: BullMQ worker and blog cron
- `src/lib/`: shared infrastructure utilities
- `prisma/schema.prisma`: data model

### Frontend structure

- `src/app/`: App Router routes and metadata files
- `src/components/`: UI and product components
- `src/lib/`: API client utilities and server query helpers
- `src/data/`: programmatic content datasets
- `src/constants/` and `src/config/`: shared config and SEO constants

## Current Architectural Observations

- Sessions are database-backed and cookie-based, not JWT bearer-token based
- The frontend depends on the backend being reachable for blog pages and dashboard SSR data
- Solutions landing pages are fully data-driven from JSON and statically parameterized
- Blog content is database-backed and fetched from the backend at render time with revalidation
