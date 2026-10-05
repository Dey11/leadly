# Monthly allowances for extended paid access

## Goal and scope

Restore scheduled monitoring for the account whose Premium allowance was
exhausted at 720 runs under a usage window spanning August 2026 to January 2027.
The user authorized the fix, production deployment, and testing on 2026-10-05.
Target: Leadly Cooldash application `leadly-tryhanabi-com`
(`uxheo2hgxldgxksmec44togm`), `Dey11/leadly:master`.

## Decisions

- Preserve ordinary monthly paid billing windows and existing tier quotas.
- Use UTC calendar-month allowances for longer paid access, capped by the
  subscription expiry. Share this policy across billing initialization,
  missing usage rows, scheduler enforcement, and account usage summaries.
- Repair legacy multi-month windows on first usage check. Reset both monitoring
  quotas when advancing into a new month; preserve credits when only shortening
  the current window. Do not grant fresh paid quota with expired access.
- Make reconciliation conditional on the previously stored window so concurrent
  requests cannot repeatedly clear newly consumed credits.
- Preserve saved monitors, schedules, subscription access, inactivity gates, and
  administrative pauses. No schema migration or provider change is needed.

## Validation

- Pure policy regressions: the production August-to-January case, monthly
  billing compatibility, end-of-month and leap-year boundaries, repeated
  checks, expired access, Free usage, and final access expiry.
- Isolated PostgreSQL persistence checks: both quota types, credit consumption,
  repeated/concurrent previews, billing initialization, and missing usage rows.
- Required backend and frontend checks and builds.
- Confirm the deployed revision, runtime database target, public health,
  authenticated quota display, and a real worker scrape. Verify account pause
  fields and saved monitor/schedule definitions remain intact.

## Risks

Repairing a legacy multi-month window grants the current month's allowance
because its accumulated usage cannot be assigned to individual historical
months. This is intentional for the affected extended-access account. Current
monthly windows retain spent credits. UTC months with 31 days still have the
existing 720-run Premium cap; changing that cap is outside this fix.

## Status

Local verification passed: 53 backend unit tests, seven isolated PostgreSQL
persistence tests, backend/frontend formatting and type checks, and both
production builds. Production deployment and live verification are pending.
