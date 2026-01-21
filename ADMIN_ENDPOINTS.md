# Admin Endpoints Documentation

Single endpoint for sending logs to Discord.

---

## Authentication

All admin routes require the `X-Admin-API-Key` HTTP header:

```bash
-H "X-Admin-API-Key: YOUR_ADMIN_API_KEY"
```

**Configuration:**

- Set `ADMIN_API_KEY` in your backend `.env` file (min 32 characters)
- Generate with: `openssl rand -hex 32`

---

## Endpoint

### POST /api/v1/admin/logs/discord

**Purpose:** Send all log files (combined + error) to Discord webhook.

**Request:**

```bash
curl -X POST https://api.leadly.live/api/v1/admin/logs/discord \
  -H "X-Admin-API-Key: YOUR_KEY"
```

No request body needed.

**Response:**

```json
{
  "success": true,
  "message": "Sent 2 log files from backend to Discord",
  "filesSent": 2
}
```

**What it sends:**

- All `.log` files from the `logs/` directory
- Files are attached to Discord message with metadata
- Includes file names and sizes in embed

---

## Requirements

| Variable                   | Purpose                       |
| -------------------------- | ----------------------------- |
| `ADMIN_API_KEY`            | Authentication (min 32 chars) |
| `DISCORD_LOGS_WEBHOOK_URL` | Discord webhook to send logs  |

---

## Automatic Hourly Logs

Logs are also sent automatically:

- **Backend**: Every hour at xx:00 UTC
- **Worker**: Every hour at xx:30 UTC

No action needed - happens automatically in production.
