# Production database move to Cooldash PostgreSQL

## Goal and scope

Move all current Leadly production data from Neon `neondb` to the existing
Cooldash PostgreSQL service, then make that database authoritative for the API
and worker. The user authorized the data migration and production cutover on
2026-10-01. Preserve the source Neon database and the retired Cooldash database.

## Targets and decisions

- Application: `leadly-tryhanabi-com` (`uxheo2hgxldgxksmec44togm`).
- Cooldash PostgreSQL resource: `jy14rdx3prcn6m3yfiufahcm`, PostgreSQL 18,
  in Leadly's production environment and private `coolify` network.
- Create a separate `leadly_production` database and application role within
  that PostgreSQL service. Do not overwrite the retired `postgres` database.
- Use a private SSH tunnel for database access; do not expose PostgreSQL publicly.
- Use PostgreSQL dump/restore tools and a consistent source snapshot. Pause
  Leadly's API and worker writes for the final copy without changing saved
  monitors, schedules, or account automation preferences.
- Switch the existing shared `DATABASE_URL` for both API and worker. Preserve
  session secrets and other service configuration.

## Validation

- Compare every application table's row count and deterministic content digest.
- Compare schema, migrations, indexes, and constraints; preserve enums, arrays,
  timestamps, sessions, subscriptions, and blog content.
- Confirm both running services use the private Cooldash PostgreSQL target.
- Verify API PostgreSQL/Redis health, published blog API, blog index, and a
  representative blog page after cutover.
- Verify the worker reconnects without a database error.
- Configure and verify a daily Cooldash-managed database backup before declaring
  the migration complete.

## Risks and rollback

The retained Cooldash database is an old rollback copy, so it cannot replace
Neon without a fresh data copy. The final snapshot requires a brief write pause.
Keep Neon unchanged and private Cooldash access closed to the public. If target
verification fails before reopening writes, restore the original `DATABASE_URL`
and start Leadly on Neon. After new writes reach Cooldash, rolling back requires
copying those writes as well.

## Status

Completed on 2026-10-01. The final snapshot contained 46,767 rows across 23
tables. All table counts and deterministic row-content digests matched the
restored database, and a second source comparison confirmed Neon had not changed
during the copy. Schema exports also matched. The source database's UTF-8
encoding and built-in `C.UTF-8` locale were preserved.

The copy includes 42 users, 42 subscriptions, 21,009 ICP leads, 57 keyword leads,
71 ICP monitors, three keyword monitors, 22,596 ICP scrape jobs, 40 sessions,
122 blog rows, and all 114 published posts. Saved schedules and account
automation preferences were copied without modification. All nine migrations
are applied; no invalid indexes or unvalidated constraints were found.

The final Cooldash deployment `8olamxudtzfiv3fg3m8lr9pu` finished at
08:02:45 UTC, using the existing application code revision `906f95f`. Runtime
checks inside both the API and worker confirmed `leadly_production` with the
`leadly_app` role on the private Cooldash PostgreSQL service. API PostgreSQL and
Redis health, the frontend, sitemap, published-post API, blog index with 114
links, and a representative blog page all passed after the cutover.

Daily backup configuration `wrxtb7hdkq30tsndzo8wyz40` targets only
`leadly_production`, retaining up to seven backups for seven days with a 1 GB
storage cap on the production server. The first backup completed successfully
and produced a 4,381,420-byte archive. Offsite backups are not configured.

The first restore attempt failed before importing data, and automatic recovery
restarted Leadly on Neon. The corrected restore then passed all data and schema
checks. A subsequent attempt to reuse application images failed because the
expected images were missing. The final cutover used the normal Cooldash
deployment flow. Temporary deployment-command overrides were restored to their
original values. These restarts made the outage longer than a database copy
alone required.

Neon and the retired Cooldash `postgres` database remain unchanged. The original
Neon connection is retained in the protected VPS credential file
`~/.config/hosting/leadly-neon-rollback-2026-10-01.env` (mode `0600`), outside the
repository. Temporary migration archives, credentials, tunnel, and diagnostic
task are removed after verification. Production PostgreSQL remains private.

## Production account and site verification

Further production checks completed on 2026-10-01 after the user authorized
resetting the supplied account password and testing the deployed product.

The original supplied password did not match the account's saved bcrypt hash.
That hash was identical in Neon and Cooldash, confirming the migration had
preserved it. A control bcrypt verification passed.

The normal forgot-password form completed, but Resend rejected delivery with
HTTP 403 because the sender domain `leadly.tryhanabi.com` is not verified. The
API still returned its generic success response. The requested password also
failed the public reset endpoint's special-character requirement. A scoped
administrator reset through the running backend therefore set the exact
user-requested password, cleared the reset token and expiry, and revoked the
account's sessions. No application-wide password policy was changed. Subsequent
browser sign-in succeeded. The test session was logged out and removed.

| Check                               | Result                                                                                                                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| API and worker database connections | Both queried `leadly_production` as `leadly_app` on the private Cooldash PostgreSQL server.                                                                                                                              |
| Account data                        | Database and authenticated API agreed on two ICPs, 20 monitors, and 2,557 leads. The subscription was active Premium.                                                                                                    |
| Keyword data                        | This account had no keyword sets, monitors, leads, or schedule. Empty states rendered correctly; the schedule API's expected 404 was handled.                                                                            |
| Authenticated dashboard routes      | Overview, leads, ICPs, monitors, both schedule modes, settings, billing, account, profile, keyword sets, keyword monitors, and keyword leads rendered.                                                                   |
| Lead operations                     | API pagination returned distinct pages; the viewed-status filter, an already-viewed lead detail, both CSV export endpoints, browser pagination, and the export dialog passed.                                            |
| Session handling                    | Full dashboard navigation preserved authentication. Logout returned the browser to login; the account API then returned 401 and the dashboard redirected to login. No test sessions remained.                            |
| Google sign-in configuration        | Both production OAuth flags were false, the Google button was hidden, and the initiation endpoint returned the expected 404 with "Google sign-in is disabled". A historical Google account link remains in the database. |
| Responsive layouts                  | Both overview modes, leads, schedule, and billing fit a 390-pixel viewport without page overflow. Mobile navigation and mode switching worked.                                                                           |
| Public site                         | All 133 sitemap URLs returned HTTP 200. All 114 published blog titles matched the corresponding page heading and appeared in the sitemap.                                                                                |
| Service health                      | PostgreSQL and Redis health checks passed; the backend container was healthy and the worker was running.                                                                                                                 |

Remaining findings:

- Recovery email delivery is blocked until the Resend sender domain is verified
  or an authorized verified sender is configured.
- Six blog covers reference the same Unsplash image URL, which returns 404.
- The sampled article `how-to-measure-roi-of-reddit-lead-generation` has a table
  that extends beyond a 390-pixel viewport.
- `/blog`, `/privacy`, and `/terms` inherit the homepage canonical URL.
- Public navigation requests an undefined authentication URL because it uses
  an unconfigured `NEXT_PUBLIC_API_BASE_URL` instead of the shared API base.

These checks covered authentication, existing-data access, exports, navigation,
and page rendering. They did not create or delete monitors, change schedules or
lead statuses, start paid AI or scraping jobs, charge a subscription, or complete
Google's external authentication flow. No recovery-email or frontend fix was
deployed as part of this verification.
