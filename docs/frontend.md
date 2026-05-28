# Frontend Documentation

## Stack

- Runtime and package manager: Bun
- Framework: Next.js 16 App Router
- Language: TypeScript
- UI: React 19
- Styling: Tailwind CSS v4
- Component primitives: Radix UI and local `components/ui`
- Data fetching: native server `fetch` plus TanStack Query on the client
- Markdown rendering: `react-markdown` with `remark-gfm`
- Motion: `motion`
- Theme handling: `next-themes`

## App Structure

Frontend code lives under `frontend/src`.

Primary areas:

- `app/`: routes, layouts, metadata, sitemap, robots, route handlers
- `components/`: dashboard, landing, auth, blog, shared, UI primitives
- `lib/`: backend fetch wrappers, formatting, validation, env utilities
- `data/`: static programmatic SEO datasets
- `config/` and `constants/`: site config, SEO config, pricing, dashboard settings

## Route Groups

### Marketing

- `/`
- `/blog`
- `/blog/[slug]`
- `/blogs` redirects to `/blog`
- `/solutions/[slug]`
- `/privacy`
- `/terms`
- `/cookies`

### Auth

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

### Dashboard

- `/dashboard`
- `/dashboard/leads`
- `/dashboard/icps`
- `/dashboard/monitors`
- `/dashboard/schedule`
- `/dashboard/settings`
- `/dashboard/account`
- `/dashboard/billing`
- `/dashboard/keyword-leads`
- `/dashboard/keyword-sets`
- `/dashboard/keyword-monitors`

### App Route Handlers

- `/api/send`
- `/api/analytics/script.js`
- `/api/analytics/api/send`

## Root Layout

`frontend/src/app/layout.tsx` defines the shared shell.

It sets:

- global metadata defaults
- font loading
- theme provider
- TanStack Query provider
- favicon switching
- top-loader
- analytics injection
- cookie consent
- global toaster

## Data Access Pattern

The frontend uses backend server fetch wrappers instead of directly exposing auth tokens in the browser.

Main pieces:

- `src/lib/env.ts`: resolves backend base URL
- `src/lib/api-client.ts`: forwards `session_token` cookies on server requests and normalizes backend errors
- `src/lib/backend-queries.ts`: typed server query helpers for account, schedules, leads, keyword monitoring, and other dashboard data

This gives dashboard layouts and pages SSR-friendly access to authenticated backend data.

## Marketing Site

The homepage is section-composed from reusable landing components:

- hero
- animated demo
- features
- dual monitoring
- three-step explanation
- problem framing
- solution framing
- competitors comparison
- use cases
- beta perks
- pricing
- FAQ
- trust and safety
- footer

The marketing home page also injects SoftwareApplication structured data.

## Blog Frontend

Blog pages are hybrid content pages:

- post list is fetched from the backend blog API
- detail page is fetched by slug from the backend blog API
- blog index and detail pages are rendered dynamically with `cache: "no-store"`
- `/blogs` redirects to `/blog` to catch the common plural URL
- Markdown is rendered with custom heading IDs for TOC generation

Blog detail page features:

- per-post metadata
- tag rendering
- share button
- table of contents
- cover image
- Markdown article body
- inline CTA

## Solutions Pages

Solution landing pages are driven by `frontend/src/data/solutions.json`.

Implementation details:

- `generateStaticParams()` prebuilds pages from JSON slugs
- route metadata uses each page's title and description
- dynamic content is mapped into generic landing components
- shared landing components are reused across the homepage and solution pages

This is a programmatic landing-page system rather than fully custom page code per role.

## Dashboard UX Model

The dashboard layout:

- fetches account summary server-side
- redirects unauthenticated users to `/login`
- loads tier and limit descriptions from the backend
- renders different nav models for lead-gen mode and keyword mode
- mounts onboarding and walkthrough UI wrappers globally

Main dashboard product surfaces:

- overview
- leads and lead detail
- ICP creation and management
- monitor creation and management
- scheduling
- keyword match review
- keyword set management
- keyword monitor management
- billing and account settings

## Styling and Design Conventions

Current repo conventions from code and `frontend/style-rules.md`:

- Tailwind is the primary styling system
- shared UI primitives live under `components/ui`
- theme-aware design is supported
- typography uses Google font variables loaded in the root layout
- rounded card-heavy UI with translucent header patterns is common
- the codebase favors compositional component reuse over monolithic page files

## Frontend Environment

Main frontend config inputs:

- `BACKEND_URL`
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_APP_URL`
- analytics-related public env vars

The site config resolves the canonical public app URL and keyword set used in metadata.

## Current Frontend Practices

- server components are used for route-level fetching
- route metadata is colocated with pages
- backend access is wrapped, not duplicated ad hoc in pages
- shared UI primitives and product-specific components are separated
- dashboard and marketing concerns are split into route groups
