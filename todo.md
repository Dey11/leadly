- [x] add pwd validation checks (he told me to ignore it)
- [] have to add paginations to everything to prevent misuse (you know reddit api better, you do this dey)
- [x] look into scheduling unique constraint failed error - possibly cuz multiple reqs are hitting at the same time. upon first login, the schedule api gets hit twice i think and the frontend throws an error due to db constraint violation. need to fix this if it still occurs. reloading fixes it.
- [] make landing page look better
- [] think about rotating the reddit credentials using a rotation strategy - future implementation
- [] maybe post levels of filtering. aggressive, moderate, mild. aggressive can bring out false positives but thats okay. mild will be more accurate but will miss some leads. moderate will be a balance between the two. -> ignore for now
- [] Use AI to suggest the subreddits to scrape based on the lead description -> future implementation

Rate limiting:
on demand cooldown: 30 minutes

Things to take care of:

- [] most leads are warm, dont see cold/neutral leads yet -> needs finetuning
- [x] make routes for forgot pwd and reset pwd
- [x] routes for email validation

- [x] logo
- [x] favicon not appearing in prod
- [x] the account icon, when i click on it, it should hav a small panel for acc info

- [x] forget pwd full flow
- if the scrape job fails, we should pick it in the next hour. we should have a failed counter, if the same thing failed 3 times, we shouldnt pick it again. make a new db table for such jobs. we need to manually check what went wrong for such jobs.
- [] need leadly support email (can send email, but receiving is done on registrar ends, dey work.)
- [x] forgot pwd needs to connect to leadly email
- [x] research about smtp servers
- what if user upgrades from pro to premium? do their usage window reset or is it carried over? how is it handled?
- are scheduled jobs checked by the exact minute or checked by the last hour vs db value?
