## Before launch

- [x] add pwd validation checks - 1 small, 1 upper, 1 special, 1 number (min 8, max 32 chars)
- [x] check if email is linked to dodo customer profile -> email change feature removed entirely (Dodo API doesn't support email updates)
- [x] Use AI to suggest the subreddits to scrape based on the lead description (ICP) w ratelimits\*
- [x] Use AI to suggest the ICP w ratelimits\*
- [x] if the scrape job fails, we should pick it in the next hour. we should have a failed counter, if the same thing failed 3 times, we shouldnt pick it again. make a new db table for such jobs. we need to manually check what went wrong for such jobs. this is critical, pls test this well
- [x] can make static landing page (since it doesnt change right? dey?)
- [x] make landing page, dashboard look better (dey)
- [x] landing page should say how we are different from the competition (especially about the fact that we are not a keyword alert tool)
- [x] need show pwd button in pwd input
- [x] a11y fixes, proper tags
- [x] widget not showing up upon first login
- [x] theme toggle in settings
- [x] types in separate files/folders, components should be broken down into smaller components, one page need not have everything, should not have everything
- [x] export leads to csv for premium plan
- [x] add a question mark to rerun the quickstart widget
- [x] prettier formatting in the backend
- [x] need to build the backend and deploy for js files
- [x] need leadly support email (can send email, but receiving is done on registrar ends, dey work.)
- [x] upi payments
- [x] leadly.helpdesk@leadly.live
- [x] posthog and umami
- [x] policy pages proofread
- [x] add something so that we can track the referrer of the user (umami does that + we have hook to track that but not needed)
- [x] proof read and fix pricing section
- [x] check pricing link from landing page
- [x] fix pricing section constants
- [x] link landing pricing section w payment link
- [x] beta users get lifetime beta price
- [x] bug found by arsh on discord channel
- [x] reduce faqs
- [x] ensure smooth scrolling is on. CURRENTLY ON, HOPE KRISH DOESNT MESS THIS UP, just check it before pushing
- [x] policy pages should have back btns
- [x] light/dark mode for logo as well
- [x] cards are the same in the landing page, need another color, remove ai like emojis
- [x] favicon not present, fix this

## Probably done/need not do. Need to test though

'-' -> Not needed
'?' -> Need to test

- [-] remove console logs
- [ ] image screenshot + good looking mac border (mac window border not done, krish will do)
- [?] tracking based on cookies. disagreeing with cookies can lead to stuff (not so imp tho)

## Todo

- [ ] fix checks for wrong subs
- [ ] better prompts to classify btw warm, cold, neutral leads
- [ ] billing checks
- [ ] demo video in landing page section
- [ ] a form for bugs, dming us directly in discord

* global rate limits ok, in memory

## Future scope

- [ ] some sort of retry mechanisms. currently if the redis got fucked, the job stays pending. we need a cron that checks for pending/failed jobs and processes them at the end of the day anyways
- [ ] toggle email alerts for pro/premium plan for warm leads
- [ ] on demand scrape jobs, with a 30min cooldown (we promised it)
- [ ] think about rotating the reddit credentials using a rotation strategy
- [ ] maybe post levels of filtering. aggressive, moderate, mild. aggressive can bring out false positives but thats okay. mild will be more accurate but will miss some leads. moderate will be a balance between the two

## When scaling is needed

- [ ] implement redis cache layer on rarely changing things like (user account/profile, icps, monitors list, schedule settings, usage stats/dashboard stats (30sec or something)), cache session (auth middleware hits db on every request)
- [ ] batch db queries (using include)

## Random q

- [ ] are scheduled jobs checked by the exact minute or checked by the last hour vs db value?
- [ ] Find out the upper constraints before it breaks (scraper mostly)
