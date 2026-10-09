# Deleted Reddit bookmark recovery

## Goal and scope

Restore new-post discovery after a deleted Reddit bookmark caused the jobs/gigs
custom-feed monitor to complete hourly scans with no results from October 6,
2026 at 11:00 UTC. Fix the shared Reddit client used by ICP and keyword scans.

## Decisions

- On an empty bookmarked listing, fetch one latest page without the bookmark.
- If the bookmark appears, process only newer posts. Otherwise process that
  bounded page and let the existing successful job transaction advance it.
- Save the newest post as the keyword bookmark, matching ICP behavior and
  Reddit's newest-first ordering.
- Validate listing fields at the Reddit boundary. Propagate request and payload
  failures so normal job retries apply.
- Preserve schedules, monitor definitions, account gates, subscription limits,
  and notification settings. No schema changes are required.

## Validation and risks

Exercise the actual Reddit client with mocked HTTP responses for deleted and
live bookmarks, subreddit and custom-feed targets, quiet feeds, normal scans,
and request failures. Check keyword bookmark advancement through its processor.
Run backend formatting, type checking, tests, and build, then review the diff.

Recovery reads at most 50 recent posts. It does not guarantee complete backfill
of the outage. Saved lead URLs remain deduplicated, and Discord receives only
newly inserted leads. Empty bookmarked scans add one listing request.

## Status

Completed on 2026-10-09 after the user authorized pushing, deploying to Cooldash,
and running a jobs/gigs recovery scan. All 64 backend unit tests and the separate
keyword processor regression passed, along with backend formatting, type checking,
integration-test type checking, and the production build.

Production target: Cooldash Leadly application `leadly-tryhanabi-com`
(`uxheo2hgxldgxksmec44togm`), database `leadly_production` as `leadly_app`.

Code commit `e9fced6` was pushed to `Dey11/leadly:master`. The existing `dey-app`
GitHub integration deployed that exact revision in deployment
`g60adgzcs4pgv3bezqohaqmj`, which finished at 20:39:52 UTC. Both API and worker
contain the recovery code and confirmed the expected production database and role.
The backend container was healthy, public API database/Redis checks passed, and
the homepage and login page returned HTTP 200.

Verification job `cmv1fjg5g00000tnzihygeenv` used the normal quota helper and
BullMQ worker. It started with the unchanged deleted bookmark `1wyymoa`, recovered
50 recent posts, and completed at 20:42:18 UTC without retries. All 50 Nebius
classifications succeeded without provider or comment-fetch warnings. Four new
lead rows were saved: one warm and three neutral. The successful transaction
advanced the bookmark to `1x1wds1`; no manual cursor reset was needed.

The worker completed its ordinary notification dispatch without logged Discord
delivery errors. A separate connection test using the account's existing enabled
Discord channel returned success. Discord messages are not persisted or readable
through the saved webhook, so receipt in the Discord client was not independently
inspected.

The verification consumed one normal scrape credit, bringing usage to 111 of 720
monthly and 22 of 24 daily credits. Saved monitor definitions, schedules,
subscription access, account pause fields, and notification preferences retained
the same configuration fingerprint. Temporary verification helpers were removed;
the completed job remains in normal account history.
