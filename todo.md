- [] validate the subreddits being entered by the user
- [] add pwd validation checks
- [] need to check if user is deleted or not before processing any request -> most of it is done i think
- [] check what happens when an invalid subreddit is entered -> need to validate all subs input
- [] have to add paginations to everything to prevent misuse
- [] look into scheduling unique constraint failed error - possibly cuz multiple reqs are hitting at the same time. upon first login, the schedule api gets hit twice i think and the frontend throws an error due to db constraint violation. need to fix this if it still occurs. reloading fixes it.
- [] look into timezone offset issues and think of normalizing the time to UTC
- [] think about rotating the reddit credentials using a rotation strategy - future implementation
- [] maybe post levels of filtering. aggressive, moderate, mild. aggressive can bring out false positives but thats okay. mild will be more accurate but will miss some leads. moderate will be a balance between the two. -> ignore for now

## For now, we are only looking at the new posts and comments, not checking for updates in the existing posts

## Use AI to suggest the subreddits to scrape based on the lead description -> future implementation

Free plan:

- Scrape once a day = total 30 times a month
- 3 subreddits

Pro plan 9usd:

- Scrape 6 times a day = total 6 \* 30 = 180 times a month
- 10 subreddits
- on demand scraping 10 times a month (ignore for now, we dont have this feature yet)

Premium plan 24usd:

- Scrape 24 times a day = total 24 \* 30 = 720 times a month
- 20 subreddits
- on demand scraping 30 times a month (ignore for now, we dont have this feature yet)

Rate limiting:
on demand cooldown: 30 minutes

Things to take care of:

- most leads are warm, dont see cold/neutral leads yet -> needs finetuning
- make sure everything is mobile friendly -> just need to check
- make routes for forgot pwd and reset pwd
- use sentra extension to add dodopayments
- check cursor status for when the ai fails, the cursor shouldnt move up (the cursor is the last post that was scraped. we are scraping a post only once, regardless of whether new comments are added or not on a later scrape)
- in the frontend, it shows -> "failed - inprogress" -> for jobs that failed. need to fix that
