# Leadly recovery follow-up

Goal: restore the local project, exclude cold Discord leads, and fix the reported monitor creation and email image failures.

Confirmed causes: production logs and local Prisma/PostgreSQL reproduction show `pg_advisory_xact_lock` returns an unsupported `void` column; the backend release image omits email logo assets.

Scope: transaction query execution, Discord eligibility/defaults/settings, logo packaging and fallback, regression tests, and a pinned Leadly-only Cooldash deployment. No unrelated resources or user monitor definitions change. Existing notification preferences are filtered at dispatch rather than rewritten.

Validation: focused notification/email tests, a disposable local PostgreSQL integration suite with concurrent duplicate checks, backend/frontend lint, typechecks and builds, followed by deployment and live HTTP/health checks. Real customer email delivery and Discord webhooks are not used for testing.

Status: local verification passed: 82 backend unit tests, four PostgreSQL integration tests, backend/frontend typechecks, formatting checks, and both production builds. Deployment pending. The only database migration changes the default notification lead types. Deployment remains manual and pinned to the reviewed fix commit.
