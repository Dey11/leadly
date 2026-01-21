# Leadly Production Launch Guide

Complete step-by-step guide to deploy Leadly on Coolify today.

---

## Prerequisites

- [ ] VPS with Coolify installed
- [ ] Domain `leadly.live` pointed to your server
- [ ] GitHub repository access
- [ ] Discord server with webhook channels

---

## Part 1: Generate Secrets

Run these commands locally to generate required secrets:

```bash
# Admin API Key (32+ characters)
openssl rand -hex 32

# Session Secret
openssl rand -hex 32
```

Save these values—you'll need them later.

---

## Part 2: Create Discord Webhooks

Create 4 webhooks in your Discord server:

| Webhook                       | Channel Purpose        |
| ----------------------------- | ---------------------- |
| `DISCORD_WEBHOOK_URL`         | Bug reports            |
| `DISCORD_PAYMENT_WEBHOOK_URL` | Payment notifications  |
| `DISCORD_LOGS_WEBHOOK_URL`    | Log streaming (admin)  |
| `DISCORD_BACKUP_WEBHOOK_URL`  | Database backup alerts |

**To create a webhook:**

1. Right-click channel → Edit Channel → Integrations → Webhooks
2. Click "New Webhook" → Copy Webhook URL

---

## Part 3: Coolify Setup

### 3.1 Create Project

1. Login to Coolify dashboard
2. Click **New Project** → Name it "Leadly"
3. Create 2 environments: **Production** and **Staging**

### 3.2 Create PostgreSQL Database (Production)

1. In **Production** environment → **New Resource** → **PostgreSQL**
2. Keep the generated password (save it!)
3. Click **Start**
4. Go to **Settings** tab → Copy the connection URL:
   ```
   postgresql://postgres:PASSWORD@localhost:5432/postgres
   ```
5. _(Optional)_ For external access: scroll to **Public Port** → Set to 5432 → Enable "Make publicly available"

### 3.3 Create Redis (Production)

1. In **Production** environment → **New Resource** → **Redis**
2. Click **Start**
3. Note the connection URL: `redis://localhost:6379`

### 3.4 Create PostgreSQL Database (Staging)

Repeat 3.2 for Staging environment with a separate database.

### 3.5 Deploy Application via Docker Compose

1. In **Production** environment → **New Resource** → **Docker Compose**
2. Select your GitHub repository: `Dey11/leadly`
3. Set Docker Compose location: `docker-compose.yml`
4. Set branch: `master`

### 3.6 Configure Environment Variables

In the Coolify app settings, add these environment variables:

```env
# Core
NODE_ENV=production
PORT=3001
FRONTEND_PORT=3000
BACKEND_PORT=3001
TAG=latest

# Database (from step 3.2)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_PASSWORD
POSTGRES_DB=postgres

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PORT=6379

# Auth (generate in Part 1)
SESSION_SECRET=your_generated_session_secret

# URLs
FRONTEND_URL=https://leadly.live
BACKEND_URL=https://api.leadly.live
NEXT_PUBLIC_BACKEND_URL=https://api.leadly.live

# Nitter
NITTER_URL=https://nitter.net

# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username

# Dodo Payments
DODO_API_KEY=your_dodo_api_key
DODO_ENVIRONMENT=live_mode
DODO_WEBHOOK_SECRET=your_dodo_webhook_secret
DODO_PRO_PRODUCT_ID=your_pro_product_id
DODO_PREMIUM_PRODUCT_ID=your_premium_product_id

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Email
RESEND_API_KEY=your_resend_api_key

# Discord Webhooks (from Part 2)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_PAYMENT_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_LOGS_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_BACKUP_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Admin (generate in Part 1)
ADMIN_API_KEY=your_generated_admin_api_key

# Billing
FEATURE_BILLING_ENFORCEMENT=on
```

### 3.7 Configure Domains

1. Go to app **Settings** → **Domains**
2. Add domains:
   - `leadly.live` → maps to frontend (port 3000)
   - `api.leadly.live` → maps to backend (port 3001)
3. Enable **SSL** (Let's Encrypt)

### 3.8 Get Deployment Webhooks

1. In Coolify app → **Webhooks** tab
2. Copy the **Deploy Webhook URL** for production
3. Repeat for staging environment

---

## Part 4: GitHub Repository Setup

### 4.1 Add Repository Secrets

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name               | Value                              | Description                             |
| ------------------------- | ---------------------------------- | --------------------------------------- |
| `COOLIFY_PROD_WEBHOOK`    | `https://your-coolify.com/api/...` | Production deploy webhook               |
| `COOLIFY_STAGING_WEBHOOK` | `https://your-coolify.com/api/...` | Staging deploy webhook                  |
| `COOLIFY_PREVIEW_WEBHOOK` | `https://your-coolify.com/api/...` | Preview deploy webhook                  |
| `COOLIFY_API_URL`         | `https://your-coolify.com`         | Coolify base URL                        |
| `COOLIFY_TOKEN`           | `your-coolify-api-token`           | Coolify API token (from Settings → API) |
| `POSTGRES_HOST`           | `your-db-host`                     | For preview DB cleanup                  |
| `POSTGRES_USER`           | `postgres`                         | DB username                             |
| `POSTGRES_PASSWORD`       | `your-db-password`                 | DB password                             |

### 4.2 Enable Coolify API

1. In Coolify → **Settings** → **API**
2. Enable API access
3. Create token with **Deploy** permissions
4. Copy token → Add as `COOLIFY_TOKEN` secret

### 4.3 Create Staging Branch

```bash
git checkout master
git checkout -b staging
git push origin staging
```

---

## Part 5: Staging Environment Setup

1. Repeat Part 3 steps for staging with:
   - Branch: `staging`
   - Domain: `staging.leadly.live`
   - Separate database
   - `NODE_ENV=staging`
   - `DODO_ENVIRONMENT=test_mode`

---

## Part 6: First Deployment

### 6.1 Push to Master

```bash
git add .
git commit -m "Production deployment setup"
git push origin master
```

### 6.2 Monitor Deployment

1. Check GitHub Actions: **Actions** tab → Watch CI workflow
2. Check Coolify: Watch deployment logs

### 6.3 Run Database Migrations

After first deploy, in Coolify:

1. Go to your app → **Terminal**
2. Run:
   ```bash
   bunx prisma migrate deploy
   ```

### 6.4 Seed Test Data (Optional)

```bash
bun run seed
```

---

## Part 6.5: Database Viewer

You have several options to view/manage your PostgreSQL database:

### Option A: Prisma Studio (Recommended for Dev)

```bash
# Run locally (connects to your DATABASE_URL)
bunx prisma studio
```

Opens at `http://localhost:5555` - great for quick data inspection.

### Option B: Adminer (Already in docker-compose)

Your `docker-compose.yml` includes Adminer:

- Access at: `http://your-server:8888`
- Server: `localhost:YOUR_POSTGRES_PORT`
- Username: `postgres`
- Password: Your DB password

### Option C: Deploy pgAdmin on Coolify

1. In Coolify → **New Resource** → **Service** → **pgAdmin**
2. Set admin email/password
3. Add your database connection

---

## Part 6.6: Understanding Migrations

### How Prisma Migrations Work

| Environment     | Command                      | What Happens                                                |
| --------------- | ---------------------------- | ----------------------------------------------------------- |
| **Development** | `bunx prisma migrate dev`    | Creates migration files + applies them + regenerates client |
| **Production**  | `bunx prisma migrate deploy` | Only applies existing migration files (safe, no changes)    |

### Migration Workflow

```mermaid
graph LR
    A[Edit schema.prisma] --> B[Run migrate dev locally]
    B --> C[Commit migration files to git]
    C --> D[Push to master]
    D --> E[Deploy runs migrate deploy]
    E --> F[Database updated in production]
```

### Step-by-Step Migration Process

**1. Make schema changes locally:**

```bash
# Edit backend/prisma/schema.prisma
```

**2. Create migration:**

```bash
cd backend
bunx prisma migrate dev --name add_new_field
```

This creates `prisma/migrations/YYYYMMDD_add_new_field/migration.sql`

**3. Commit the migration:**

```bash
git add prisma/migrations
git commit -m "Add migration: add_new_field"
git push origin master
```

**4. On production deploy, run:**

```bash
bunx prisma migrate deploy
```

### Important Notes

> ⚠️ **Never run `migrate dev` in production** - it can drop data!

> ✅ Always run `migrate deploy` in production - it only applies existing migrations.

### Automating Migrations in Docker

Add this to your backend Dockerfile or docker-compose command:

```yaml
# In docker-compose.yml, for leadly_backend:
command: >
  sh -c "bunx prisma migrate deploy && bun dist/index.js"
```

Or create an entrypoint script to run migrations before starting the app.

## Part 7: Verify Deployment

### 7.1 Health Checks

- [ ] `https://leadly.live` loads frontend
- [ ] `https://api.leadly.live` returns "Hello World"
- [ ] Login works with test user

### 7.2 Test Admin Endpoint

```bash
# List log files
curl -X GET https://api.leadly.live/api/v1/admin/logs \
  -H "X-Admin-API-Key: YOUR_ADMIN_API_KEY"

# Send logs to Discord
curl -X POST https://api.leadly.live/api/v1/admin/logs/discord \
  -H "X-Admin-API-Key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"level": "combined", "lines": 30}'
```

### 7.3 Verify Webhooks

- Push a small change to master → Should trigger deployment
- Wait for backup schedule → Should see Discord notification

---

## Part 8: Uptime Kuma Setup

Since you already have Uptime Kuma on Coolify:

1. Add monitor for `https://leadly.live` (HTTP 200)
2. Add monitor for `https://api.leadly.live` (HTTP 200)
3. Set check interval: 60 seconds
4. Enable notifications to Discord

---

## Part 9: Preview Deployments (Optional)

For per-branch preview deployments:

1. Create a "preview" template in Coolify
2. Configure `COOLIFY_PREVIEW_WEBHOOK` to point to preview environment
3. When pushing feature branches, they'll auto-deploy

**Note:** Preview DB isolation requires additional setup in Coolify for dynamic database creation.

---

## Troubleshooting

### Deployment Fails

```bash
# Check Coolify logs
docker logs <container-name>

# Check GitHub Actions logs
# Go to Actions tab → Click failed workflow
```

### Database Connection Issues

```bash
# Test connection from Coolify terminal
psql $DATABASE_URL -c "SELECT 1"
```

### Logs Not Appearing

1. Ensure `logs/` directory exists and is writable
2. Check `LOG_LEVEL` environment variable

### Backup Not Sending to Discord

1. Verify `DISCORD_BACKUP_WEBHOOK_URL` is set
2. Check backup container logs:
   ```bash
   docker logs leadly_backup
   ```

---

## Quick Reference

| URL                           | Purpose             |
| ----------------------------- | ------------------- |
| `https://leadly.live`         | Production frontend |
| `https://api.leadly.live`     | Production API      |
| `https://staging.leadly.live` | Staging environment |
| `https://your-coolify.com`    | Coolify dashboard   |

| Command                      | Purpose           |
| ---------------------------- | ----------------- |
| `bun run seed`               | Create test users |
| `bunx prisma migrate deploy` | Run migrations    |
| `bun run typecheck`          | Check TypeScript  |
| `bun run build`              | Build backend     |

---

## Checklist

- [ ] Discord webhooks created (4 channels)
- [ ] Coolify project created with Production + Staging
- [ ] PostgreSQL databases created (prod + staging)
- [ ] Redis created
- [ ] Environment variables configured
- [ ] Domains configured with SSL
- [ ] GitHub secrets added
- [ ] Staging branch created
- [ ] First deployment successful
- [ ] Migrations run
- [ ] Uptime Kuma monitors added
- [ ] Test login working
- [ ] Backup notification tested

---

**You're live! 🚀**
