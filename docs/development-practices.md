# Development Practices

## Repo-Level Working Rules

These rules are already implied by the repo instructions and current implementation style.

- use Bun for package management and scripts
- use Tailwind for web styling
- prefer modular files over oversized all-in-one files
- prioritize readability over cleverness
- validate configuration early
- keep backend and frontend concerns separated

## Package Management and Commands

Use Bun commands across both apps.

### Frontend

- `bun run dev`
- `bun run build`
- `bun run lint:fix`

### Backend

- `bun run dev`
- `bun run worker`
- `bun run build`
- `bun run lint`
- `bun run lint:fix`
- `bun run test`
- `bun run prisma:generate`
- `bun run prisma:migrate`
- `bun run prisma:push`
- `bun run seed`

Production deploys use `bunx prisma migrate deploy` from the backend container startup path. Use `bun run prisma:migrate` only against a local or development database to create migration files, then deploy those files through Coolify.

## Frontend Practices

Current frontend conventions:

- Tailwind-first styling
- reusable primitives under `components/ui`
- product-specific components grouped by domain
- route groups for auth, marketing, and dashboard concerns
- shared metadata strategy in layouts and route files
- server-side backend access through `src/lib/api-client.ts` and `src/lib/backend-queries.ts`

## Backend Practices

Current backend conventions:

- route definitions separate from controllers
- infrastructure utilities under `src/lib`
- schedulers under `src/services`
- heavy async work handled in processors and workers
- environment variables validated through Zod
- session and verification logic centralized in middleware
- usage and rate limiting enforced server-side

## Data and Domain Practices

- Prisma schema is the canonical data contract
- schedules are stored as UTC hour arrays
- usage is tracked separately for lead-gen and keyword monitoring
- blog content is database-backed
- solution landing pages are file-backed in JSON

## UI and Styling Practices

From the current codebase and `frontend/style-rules.md`:

- Tailwind CSS v4 is the standard
- Radix and local UI wrappers are the preferred primitive layer
- theming is built in and should be preserved
- font usage is centralized in the root layout
- interaction polish uses subtle motion rather than excessive animation

## Operational Practices

- expose a backend health endpoint
- keep Redis and PostgreSQL as explicit dependencies
- run background processing outside the request path
- log operational behavior and ship logs to Discord for monitoring
- close Redis and Prisma connections during shutdown

## Documentation Practices Going Forward

To keep `docs/` authoritative:

- update `docs/backend.md` when routes, auth, billing, scheduling, or the data model change
- update `docs/frontend.md` when route groups, rendering strategy, or shared UI architecture changes
- update `docs/features.md` when product scope changes
- update `docs/seo-content.md` when blog generation, solutions generation, sitemap rules, metadata, or SEO strategy changes
- update `docs/architecture.md` when deployment topology or runtime responsibilities change

## Known Source Files to Review Before Major Changes

- `/README.md`
- `/backend/API_REFERENCE.md`
- `/frontend/style-rules.md`
- `/docs/`

This matches the repo requirement to look at docs first before starting implementation work.
