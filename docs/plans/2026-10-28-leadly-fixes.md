# Leadly recovery follow-up

Goal: restore the local project, exclude cold Discord leads, and fix the reported monitor creation and email image failures.

Confirmed causes: production logs and local Prisma/PostgreSQL reproduction show `pg_advisory_xact_lock` returns an unsupported `void` column; the backend release image omits email logo assets.

Scope: transaction query execution, Discord eligibility/defaults/settings, logo packaging and fallback, regression tests, and a pinned Leadly-only Cooldash deployment. No unrelated resources or user monitor definitions change. Existing notification preferences are filtered at dispatch rather than rewritten.

Validation: focused notification/email tests, a disposable local PostgreSQL integration suite with concurrent duplicate checks, backend/frontend lint, typechecks and builds, followed by deployment and live HTTP/health checks. Real customer email delivery and Discord webhooks are not used for testing.

Status: local verification passed: 82 backend unit tests, four PostgreSQL integration tests, backend/frontend typechecks, formatting checks, and both production builds. Cooldash deployment `zwlrkfoyhuo1vyug6lurdbbt` finished successfully on 28 October at 08:27 UTC, pinned to fix commit `301be1c6100ea3576a4cb7ff0cff4502b7c48ac8`. The only database migration changes the default notification lead types. Deployment remains manual and pinned to the reviewed fix commit.

## Live verification

All three Leadly services were replaced successfully. Login and registration return HTTP 200; signed-out monitor/settings requests redirect to login. `/health` reports PostgreSQL and Redis connected. Runtime filesystem checks confirm both backend and worker contain the corrected locking query, the notification policy, and the exact repository PNG asset. All 53 unrelated containers retain their pre-deployment start times (56 running containers total). Automatic deployments remain disabled.

No live customer account was used to create monitors, and no real verification email or Discord notification was sent during testing. Email payloads and Discord dispatch were verified through intercepted transports, and monitor creation/update/concurrent duplicate behavior was exercised against disposable local PostgreSQL. The test container and its volume were removed afterward. Private operational evidence is stored outside the repository at `/home/dev/private/leadly-fixes-2026-10-28/`.
