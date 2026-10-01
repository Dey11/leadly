# Production readiness after the Cooldash database cutover

## Goal and scope

Restore password recovery and fix the issues found while testing Leadly at
`leadly.tryhanabi.com`. Verify authentication, scheduled Reddit collection, AI
qualification, lead persistence, public blogs, and mobile article rendering.
Preserve existing monitors, schedules, account automation choices, and quotas.

## Findings

- Resend rejects recovery messages because `leadly.tryhanabi.com` is only partially
  verified. The required DKIM, SPF TXT, and return-path MX records resolve correctly
  in Namecheap DNS. Trigger verification before changing correct DNS records.
- Production's 09:00 UTC schedule completed all 20 account monitors. Investigate
  qualification and stored results as well as job completion.
- Qualification incorrectly discards buyers hiring a "freelance developer" and
  treats AI reasoning such as "not a for hire offer" as vendor promotion. Restrict
  the filter to explicit offers in the lead title and keep buying-role wording.
- Authentication controllers duplicate middleware rate-limit checks and increments.
  Keep one counter in middleware and cover the request boundaries with route tests.
- Six blog covers use an Unsplash URL that returns 404. Replace that stock-image
  entry and backfill only rows with the exact broken URL.
- Blog tables overflow narrow screens. Contain each table in a scrollable region.
- Blog index, privacy, and terms pages inherit the homepage canonical URL.
- Public navigation requests an unconfigured API URL and a nonexistent auth route.
  Use the existing account endpoint and configured API base URL.
- Google sign-in is disabled in production. Password login is available; enabling
  OAuth is a separate configuration choice.

## Validation and delivery

Run backend formatting, type checking, behavioral tests, and build. Run frontend
formatting, type checking, and build. Verify table containment in a browser and
canonical URLs in rendered HTML. Confirm production recovery-mail provider status,
authenticated API behavior, worker execution, AI qualification, and database
persistence. Review and commit changes locally; GitHub push requires explicit
authorization under the global Git instructions.

## Status

Resend verification and the live blog-image backfill are complete. Application
fixes pass validation locally and await authorized publication to GitHub and the
Cooldash deployment pipeline.

## Verification results

- The sender domain and required records are verified. Resend delivered the
  recovery email; its token hash matches PostgreSQL and its expiry is valid.
- Password login passed in the collaborative browser and headless browser.
- All 20 scheduled ICP monitors completed at 09:00 UTC. Worker logs show successful
  Nebius requests and Gemini fallback, alongside transient provider failures.
- Two manual `r/forhire` queue jobs completed without error. Both used normal
  account quota and returned no newly qualified leads.
- A temporary keyword set and monitor collected 50 Reddit posts, persisted 27
  matches, and displayed them in the authenticated dashboard with pagination.
  The API returned the same 27 total matches and a nonempty CSV export. The test
  set, monitor, job, and matches were removed; keyword configuration returned to
  its original empty state. Existing ICP monitors and schedules were preserved.
- Production generated and saved a 403-character AI outreach draft for an existing
  viewed lead. No outreach message was sent. API logout passed; test sessions were
  removed, including the detached collaborative browser's session.
- A controlled buying example classified as WARM through production's Nebius
  credential using the corrected qualification code. It was not saved as a lead.
  Regression tests first reproduced both incorrect vendor-filter exclusions and
  then passed after the fix; explicit vendor offers remain excluded.
- Six cover URLs and 33 article bodies were repaired in one transaction. The
  public API still serves 114 published posts with no references to that broken URL.
  All 22 unique cover and inline-image URLs returned HTTP 200 image responses.
- The corrected article was rendered from source with the production build's CSS.
  Its page width matched 390, 768, and 1280-pixel viewports; the mobile table scrolled
  inside its labeled region. No additional development server was started.
- The built privacy and terms HTML contains the correct canonical URLs; the blog
  metadata resolves to `/blog`.
- Backend formatting, type checking, 38 tests, and build passed. Frontend formatting,
  type checking, and production build passed.

Google OAuth remains disabled in production. Payment charges and Google's external
sign-in flow were not exercised. The final deployment must be followed by live
checks of the corrected account navigation, article layout, request limits, and
qualification behavior.
