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

Local implementation complete. All 64 backend unit tests and the separate keyword
processor regression pass, along with backend formatting, type checking,
integration-test type checking, and the production build. No production bookmark
reset, deployment, or manual scan has been performed for this fix.

Production target: Cooldash Leadly application `leadly-tryhanabi-com`
(`uxheo2hgxldgxksmec44togm`), database `leadly_production` as `leadly_app`.
