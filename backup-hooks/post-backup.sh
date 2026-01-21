#!/bin/bash
# Post-backup hook script for Discord notifications
# This script is called after each successful backup

BACKUP_FILE=$1
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S UTC')
FILENAME=$(basename "$BACKUP_FILE")

# Check if Discord webhook is configured
if [ -z "$DISCORD_BACKUP_WEBHOOK_URL" ]; then
    echo "DISCORD_BACKUP_WEBHOOK_URL not set, skipping Discord notification"
    exit 0
fi

# Send notification to Discord
curl -s -H "Content-Type: application/json" \
    -d "{
        \"username\": \"Leadly Backups\",
        \"embeds\": [{
            \"title\": \"✅ Database Backup Complete\",
            \"color\": 5763719,
            \"fields\": [
                {
                    \"name\": \"📁 File\",
                    \"value\": \"\`$FILENAME\`\",
                    \"inline\": true
                },
                {
                    \"name\": \"📊 Size\",
                    \"value\": \"$BACKUP_SIZE\",
                    \"inline\": true
                },
                {
                    \"name\": \"🕐 Time\",
                    \"value\": \"$TIMESTAMP\",
                    \"inline\": false
                }
            ],
            \"footer\": {
                \"text\": \"Leadly PostgreSQL Backup\"
            }
        }]
    }" \
    "$DISCORD_BACKUP_WEBHOOK_URL"

echo "Backup notification sent to Discord"
