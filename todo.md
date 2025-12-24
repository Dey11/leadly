## Before launch
- [ ] add pwd validation checks - 1 small, 1 upper, 1 special, ...
- [ ] check if email is linked to dodo customer profile -> resetting email shouldnt be allowed then since dodo creates the customer
- [ ] make landing page, dashboard look better (dey)
- [ ] Use AI to suggest the subreddits to scrape based on the lead description (ICP) w ratelimits*
- [ ] Use AI to suggest the ICP w ratelimits*
- [ ] if the scrape job fails, we should pick it in the next hour. we should have a failed counter, if the same thing failed 3 times, we shouldnt pick it again. make a new db table for such jobs. we need to manually check what went wrong for such jobs. this is critical, pls test this well
- [ ] need leadly support email (can send email, but receiving is done on registrar ends, dey work.)
      
* global rate limits ok, in memory

## Future scope
- [ ] on demand scrape jobs, with a 30min cooldown (we promised it)
- [ ] most leads are warm, dont see cold/neutral leads yet -> needs finetuning
- [ ] think about rotating the reddit credentials using a rotation strategy
- [ ] maybe post levels of filtering. aggressive, moderate, mild. aggressive can bring out false positives but thats okay. mild will be more accurate but will miss some leads. moderate will be a balance between the two
    

## Random q
- [ ] are scheduled jobs checked by the exact minute or checked by the last hour vs db value?
- [ ] have to add paginations to everything to prevent misuse (need to test if done)
- [ ] Find out the upper constraints before it breaks (scraper mostly)
