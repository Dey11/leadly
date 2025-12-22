# Leadly Context & Documentation

## Overview

Leadly is an AI-powered lead generation platform that monitors Reddit for high-intent conversations. It allows B2B sales teams to define Ideal Customer Profiles (ICPs), track specific subreddits and keywords, and receive alerts for relevant discussions.

**Core Value Proposition**: "Turn Reddit Conversations into Revenue."

## Architecture

### Tech Stack

- **Frontend**: Next.js 14 (React), Tailwind CSS, ShadCN UI, React Query.
- **Backend**: Node.js (Express), TypeScript.
- **Database**: PostgreSQL (via Prisma ORM).
- **Queue/Background**: Redis, BullMQ (for scraping jobs).
- **AI**: Gemini 2.5 Flash (via Google AI SDK).
- **Payments**: Dodopayments.
- **External APIs**: Reddit API.

### Project Structure

- `backend/`: Express server, API routes, workers.
  - `src/controllers`: Business logic for Monitors, Schedule, Auth, etc.
  - `src/routes`: API definitions.
  - `src/workers`: Background workers (BullMQ) for processing Reddit scrapes.
  - `src/services`: External integrations (Reddit).
- `frontend/`: Next.js application.
  - `src/app`: App Router pages (Dashboard, Landing, Auth).
  - `src/components`: Reusable UI components.

## Features & Implementation Decisions

### 1. User Management & Auth

- **Implementation**: Custom authentication using `bcrypt` and JWT (handled in `auth.ts`).
- **Profiles**: Users have profiles linked to subscriptions.
- **Limits**: Feature access is gated by `SubscriptionTier` (FREE, PRO, PREMIUM) defined in `constants.ts`.

### 2. Monitoring (The Core Engine)

- **Concept**: Users create "Monitors" targeting specific subreddits with optional keyword filters.
- **Implementation**:
  - **Creation**: Validates subreddit existence via Reddit API (`monitor.ts`). Checks tier limits.
  - **Execution**: Scrapes are scheduled tasks.
  - **Engine**: `bullmq` worker (`reddit.worker.ts`) processes jobs.
  - **AI Analysis**: Scraped posts are analyzed by Gemini Flash to determine relevance (relevance score > 0.75) and sentiment.

### 3. Scheduling & quotas

- **Decisions**: Scrapes are not real-time streams but scheduled "windows".
- **Logic**: Users select "Active Hours" for scraping in `schedule.ts`.
- **Limits**:
  - **Free**: 1 scrape/day (fixed at 12 PM).
  - **Pro**: 6 scrapes/day (selectable from 4-hour blocks).
  - **Premium**: 24/7 coverage (hourly).

### 4. Billing

- **Provider**: Dodopayments.
- **Plans**: Defined in frontend and backend constants.
  - **Free**: 3 subreddits, 30 scrapes/mo.
  - **Pro ($9/mo)**: 10 subreddits, 180 scrapes/mo.
  - **Premium ($24/mo)**: 20 subreddits, 720 scrapes/mo.

### 5. Frontend & Landing Page

- **Design System**: ShadCN UI + Tailwind.
- **Landing Page**: converting landing page with sections for Features, Workflow, Use Cases, Pricing.
- **Note**: Some features like "Draft Generation" and "Intent Scoring" are currently planned/backend-supported but may not be fully exposed in the UI yet.

## Development Workflows

- **Local Dev**: Run `bun run dev` in both `frontend` and `backend` directories.
- **Database**: `prisma migrate dev` to update schema.
- **Workers**: Ensure Redis is running for BullMQ.
