# Nebius-first AI and free-tier inactivity automation

## Status

Complete. The original Nebius-first and inactivity work and the all-tier
administrative-pause extension are deployed. All 40 non-deleted production
accounts were administratively paused at `2026-08-21T07:15:18.537Z`, including
39 Free accounts and the single internally granted Premium account.

## Goal

Use Nebius Token Factory's DeepSeek V4 Flash as Leadly's first-choice AI provider across every AI-assisted product and content workflow, and pause all scheduled automation for free-tier accounts after three days without authenticated product activity until the user explicitly enables it again.

## Context

Before this work, Leadly put Gemini first for classification and ICP generation,
WaveSpeed first for DM generation, and had no account-level inactivity state.
The production Coolify application already stored `NEBIUS_API_KEY`. A live
pre-implementation test confirmed that `deepseek-ai/DeepSeek-V4-Flash` accepts
strict structured-output requests through the repository's OpenAI-compatible
Vercel AI SDK adapter.

## Scope

- Add Nebius to the shared AI provider registry and make it the default first choice for every AI operation.
- Move direct-Gemini blog and programmatic-SEO generators onto the shared provider adapter.
- Preserve Gemini, WaveSpeed, and Cerebras as fallbacks in their existing relative order.
- Validate and pass `NEBIUS_API_KEY` to the backend and worker containers.
- Track authenticated product activity with bounded write frequency.
- Pause ICP scheduling, keyword scheduling, retries, stuck-job recovery, and queued job execution for inactive free-tier accounts.
- Keep monitor and schedule definitions unchanged while automation is paused.
- Expose automation state through the authenticated account API and add an idempotent re-enable operation.
- Display a dashboard-wide banner with an explicit “Enable jobs again” action.
- Represent administrative pauses separately from inactivity so every tier can
  be stopped without changing subscriptions, monitors, or schedules.

## Non-goals

- No global AI concurrency limiter or retry redesign.
- No automatic reactivation merely because a user returns.
- No inactivity pause for Pro or Premium subscriptions; administrative pauses
  are a separate all-tier state.
- No deletion or pausing of individual monitor records.
- No change to subscription quotas or scheduled hours.

## Chosen architecture

The `User` record owns `lastActiveAt`, `freeAutomationPausedAt`, and
`administrativeAutomationPausedAt`. A cohesive backend automation-policy module
calculates eligibility, records throttled activity, applies inactivity and
administrative gates with explicit reasons, clears stale free-tier state for
paid accounts, and clears both pause sources on explicit re-enable.

The activity write claims eligible recent activity before policy evaluation, and processor completion/failure writes include the account-eligibility predicate in the database update itself. These write-boundary checks prevent stale scheduler reads or late worker results from overriding the three-day gate.

Both schedulers apply the same policy before usage consumption or job creation. Retry and stuck-job selectors exclude paused inactive free-tier accounts. Processors perform a final eligibility check so already queued work cannot bypass the account gate. When the pause transition wins a race with in-flight processing, pending and running job records are cancelled and the processor is prevented from committing leads, cursor movement, completion, or retry state.

The account response carries the effective automation state. A dashboard-shell banner calls an authenticated account endpoint, hides only after a successful response, and refreshes server-rendered state.

The administrative extension uses a second timestamp rather than overloading
the free-tier field. A protected admin operation supports a read-only preview
and an explicitly confirmed, serializable all-account pause. Administrative
state takes precedence over subscription policy; the existing account
re-enable operation clears both pause sources and refreshes activity.

## Alternatives considered

- **Pause each monitor:** rejected because it overwrites user intent and cannot distinguish an inactivity pause from a manual monitor pause.
- **Clear the pause automatically on return:** rejected because the requested UX requires explicit re-enablement.
- **Write activity on every request:** rejected because it creates unnecessary database load; writes are throttled while preserving a safe margin inside the three-day window.
- **Track only fresh authentication events:** rejected because seven-day sessions could cause actively using accounts to be paused.
- **Backfill an inferred last-login time:** rejected because the previous schema has no reliable authenticated-activity timestamp. Existing users receive a three-day grace period from migration time.

## Implementation phases

1. Add the Prisma fields and migration, then implement automation-policy behavior tests.
2. Integrate the policy into authentication, account APIs, schedulers, retry/recovery selection, and processors.
3. Add Nebius to the shared provider adapter, update every default provider order, and migrate direct-Gemini content generators.
4. Add the dashboard banner and its re-enable mutation.
5. Update documentation and run backend/frontend verification.
6. Commit, push to `master`, observe Coolify deployment and migration, and run a small production Nebius classification check.
7. Add and deploy the all-tier administrative pause, preview its production
   scope, apply it to every non-deleted account, and verify the shared recovery
   banner and scheduler/processor gates.

## Validation

- Live Nebius tests with the production Coolify key: strict structured output, free-form text, and the real lead-classification prompt all completed through `nebius`.
- Forced-primary-failure test: an intentionally invalid Nebius key fell back successfully to Gemini with valid structured output.
- Focused unit tests for the three-day boundary, paid-tier exemption, explicit re-enable state, and provider order.
- Focused scheduler integration tests confirm paused accounts consume no credits and create, enqueue, retry, or run no ICP/keyword jobs.
- Backend lint, type check, full test suite, and production build.
- Frontend lint and production build.
- Coolify deployment completed successfully for feature revision `942c167`.
- The public backend health check reported connected database and Redis services,
  and the frontend returned HTTP 200. Because the backend entrypoint runs
  `prisma migrate deploy` under `set -e` before starting the API, the healthy
  backend also confirms the additive migration completed without blocking
  startup.
- A post-deployment, non-persistent live-key smoke test exercised both structured
  and free-form generation through the repository adapter; both selected
  `nebius`.
- Administrative-pause revision `4de1513` passed backend lint, type checking,
  all 29 backend tests, backend build, frontend formatting and type checking,
  and the frontend production build before deployment.
- The protected production preview reported 40 affected accounts, 6 cancellable
  ICP jobs, and 0 cancellable keyword jobs. The confirmed operation paused all
  40 accounts and cancelled those 6 ICP jobs.
- Post-apply API and direct database checks reported 40 administratively paused
  accounts, 0 unpaused accounts, 0 runnable or scheduled-retry ICP jobs, and 0
  runnable or scheduled-retry keyword jobs. The backend remained healthy with
  database and Redis connectivity, and the frontend returned HTTP 200.

## Risks

- The Nebius endpoint is a shared public endpoint whose availability may change; fallbacks remain enabled.
- Scheduler runs define how quickly an inactive account is paused. Both product schedulers run hourly, with the keyword scheduler offset to minute 30.
- An external Reddit or AI request already in flight cannot be forcibly
  aborted, but its results are discarded when an account-level pause wins the
  job completion transaction.
- A failed production migration would prevent backend startup; migration SQL must remain additive and backward-compatible with the previous application image.
