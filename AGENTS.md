# Leadly — AGENTS.md

Leadly is a Reddit lead-intelligence product for sales teams. It combines a Next.js dashboard with an Express API, PostgreSQL persistence, Redis/BullMQ job delivery, scheduled Reddit monitoring, and shared AI workflows.

## Non-Negotiable Core Principles

- Preserve the two product modes: AI-qualified ICP monitoring and keyword monitoring.
- Keep subscription, usage, schedule, and automation eligibility checks on the backend. The frontend may present state but must not define enforcement.
- Treat monitor definitions and schedules as user data. Operational pauses must not silently rewrite or delete them.
- Keep AI providers behind the shared `backend/src/lib/ai.ts` adapter so every AI surface gets the same ordering and fallback behavior.
- Never expose credentials in source, logs, tests, plans, or command output.

## Note

Explicit user instructions take precedence. Keep changes scoped, reversible, and compatible with the production Coolify topology. Production writes, deployment, and credential use require explicit authorization for the named Leadly target.

## Project Glossary

- **ICP monitoring**: Reddit monitoring that classifies posts against an ideal customer profile with AI.
- **Keyword monitoring**: Reddit monitoring that matches configured keywords without AI classification.
- **Automation**: Scheduled ICP jobs, keyword jobs, retries, and stuck-job recovery.
- **Monitor**: A saved Reddit target. A monitor can remain active while account-level automation is paused.
- **Free-tier inactivity pause**: An account-level automation gate applied after the configured period without authenticated product activity.
- **Administrative automation pause**: An all-tier account gate that stops future automation until the account explicitly re-enables it.
- **Scheduler**: Backend cron logic that finds eligible users and starts jobs.
- **Worker**: The BullMQ consumer that performs ICP scrapes and AI classification.

## Development & Execution Rules

- Use Bun for dependency installation, scripts, tests, linting, type checking, and builds.
- Run backend commands from `backend/` and frontend commands from `frontend/`; there is no root package manifest.
- Backend verification: `bun run lint`, `bun run typecheck`, `bun test src`, and `bun run build`.
- Frontend verification: `bunx prettier --check .`, `bunx tsc --noEmit`, and `bun run build`.
- Add focused behavioral tests for account automation policy and shared AI provider ordering. Add scheduler integration tests when orchestration changes introduce behavior not already owned by the policy layer.
- Prisma schema changes require a checked-in migration under `backend/prisma/migrations/`. Production applies migrations through the backend container entrypoint with `prisma migrate deploy`.
- Keep authentication and automation-state mutations in the backend. Forward the `session_token` cookie through existing frontend request helpers.
- The production application is the Coolify Docker Compose app for `Dey11/leadly` on `master`; backend, worker, and frontend use the root `docker-compose.yml`.
- Update `README.md` and the centralized `docs/` documentation when provider order, schemas, commands, architecture, or visible behavior changes.
- Do not stop or restart unrelated processes, containers, browsers, or deployments.
- Inspect the full diff before committing. Never commit environment files, credentials, generated caches, build output, or unrelated user work.
