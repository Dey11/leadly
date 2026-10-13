# Billing reliability repair

Status: deployed to Cooldash Leadly production on 2026-10-13. No payment charges were made during verification.

## Goal and scope

Repair checkout, tier changes, webhook delivery, entitlement enforcement, and billing UI recovery. Preserve monitor definitions, schedules, internal paid grants, and the production Compose topology.

## Decisions

- Upgrade requests use Dodo's `prevent_change` payment-failure policy. Paid access changes only through confirmed subscription events. Downgrades apply at the next billing date.
- Verify webhook signatures, then process subscriptions and durable event completion in one PostgreSQL transaction before returning success. Transaction advisory locks serialize duplicate deliveries and each user's subscription changes, without deleting historical webhook rows.
- Store the last subscription event timestamp to ignore older deliveries. Events for a previous subscription cannot change the replacement subscription. A new subscription must activate before replacing an existing provider subscription. Remember first-checkout failures and holds for status reporting and portal recovery.
- Resolve effective tier from subscription status and access expiry at every backend feature boundary. Preserve the subscribed tier for billing recovery and internally granted access.
- Billing results verify the authenticated user's exact subscription and requested tier. Redirect parameters alone never establish success.
- Preserve consumed usage within a billing cycle; reset on activation/new renewal, not every overlapping subscription notification.

## Validation and risks

Validation passed: 81 backend tests, 6 billing integration tests, and 8 quota integration tests. Both integration suites used isolated local PostgreSQL databases with all migrations applied. Backend lint, typecheck, and build passed; frontend formatting, typecheck, and production build passed. Focused billing and scheduler tests were repeated after final recovery and fixture corrections.

Browser checks mounted the changed components with mocked billing calls. Pricing loads when the upgrade dialog opens; pricing failures block confirmation and can be retried; failed upgrades leave both parent and dialog controls usable. Missing subscription references and a `status=succeeded` URL remain pending until the backend confirms access. These checks made no payment requests.

The checked-in migration adds event ordering metadata and an event lookup index. External Dodo test-mode charges and live delivery remain unverified without an authorized payment environment. Existing historical FAILED events still require provider replay; successful future delivery alone cannot repair past lost notifications.

## Production release

The user authorized pushing and deploying to Cooldash application `leadly-tryhanabi-com` (`uxheo2hgxldgxksmec44togm`), including the migration. Commit `00240ea` was pushed to `Dey11/leadly:master`; the existing GitHub integration started deployment `iqykkob06chmjysojn5xgpmz`, which finished at 15:34:57 UTC on 2026-10-13.

Before deployment, the application configuration confirmed private PostgreSQL resource `jy14rdx3prcn6m3yfiufahcm`, database `leadly_production`, role `leadly_app`, and enabled startup migrations. Backend runtime logs confirmed `20261011094500_billing_event_ordering` was applied successfully. Deployment logs reported the backend healthy and the frontend and worker started. Public API database/Redis health returned success; login and billing-result pages returned HTTP 200. Billing status rejected unauthenticated requests, and the webhook rejected an invalid signature with HTTP 401.

CI exposed scheduler module mocks replacing real automation exports under a different file-loading order. Isolating the scheduler suite in a subprocess resolves that ordering failure without changing runtime behavior. A combined import-order reproduction and the complete backend suite passed after the correction; the wrapper runs all four original scheduler behavior tests in its child process.

Verification did not initiate purchases, change account tiers or schedules, or replay historical billing events.
