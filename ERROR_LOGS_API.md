# Error Logs API Reference

Single endpoint to send all logs to Discord.

---

## Send All Logs to Discord

```bash
POST /api/v1/admin/logs/discord
```

**Example:**

```bash
curl -X POST https://api.leadly.live/api/v1/admin/logs/discord \
  -H "X-Admin-API-Key: YOUR_ADMIN_API_KEY"
```

**Response:**

```json
{
  "success": true,
  "message": "Sent 2 log files from backend to Discord",
  "filesSent": 2
}
```

---

## What Gets Sent

| File Type        | Description                         |
| ---------------- | ----------------------------------- |
| `combined-*.log` | All logs (info, warn, error, debug) |
| `error-*.log`    | Error-level logs only               |

Both file types are sent as Discord attachments.

---

## Requirements

- `ADMIN_API_KEY` must be set (min 32 characters)
- `DISCORD_LOGS_WEBHOOK_URL` must be set
- Generate key with: `openssl rand -hex 32`

---

## Automatic Hourly Posting

Logs are sent automatically every hour:

- Backend logs at xx:00 UTC
- Worker logs at xx:30 UTC
