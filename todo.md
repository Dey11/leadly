- [] validate the subreddits being entered by the user
- [] add pwd validation checks
- [] need to check if user is deleted or not before processing any request
- [] check what happens when an invalid subreddit is entered
- [] have to add paginations to everything to prevent misuse
- [] look into scheduling unique constraint failed error - possibly cuz multiple reqs are hitting at the same time
- [] look into timezone offset issues and think of normalizing the time to UTC
- [] think about rotating the reddit credentials using a rotation strategy
- [] maybe post levels of filtering. aggressive, moderate, mild. aggressive can bring out false positives but thats okay. mild will be more accurate but will miss some leads. moderate will be a balance between the two.

## For now, we are only looking at the new posts and comments, not checking for updates in the existing posts

## We take credits only for the leads we provide and not for the posts we fetch

## Use AI to suggest the subreddits to scrape based on the lead description

Free plan:

- Scrape once a day = total 30 times a month
- 3 subreddits

Pro plan 9usd:

- Scrape 6 times a day = total 6 \* 30 = 180 times a month
- 10 subreddits
- on demand scraping 10 times a month

Premium plan 24usd:

- Scrape 24 times a day = total 24 \* 30 = 720 times a month
- 20 subreddits
- on demand scraping 30 times a month

Rate limiting:
on demand cooldown: 30 minutes
