#!/bin/sh
set -e

LATEST_BACKUP=$(ls -t /backups/last/*.sql.gz | head -1)

curl -s \
  -F chat_id="$BACKUP_CHANNEL_ID" \
  -F document=@"$LATEST_BACKUP" \
  https://api.telegram.org/bot$BACKUP_BOT_TOKEN/sendDocument
