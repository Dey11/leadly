# Workflows & Automation Guide

Comprehensive explanation of Leadly's automation and deployment strategy.

---

## Overview

The CI/CD pipeline is simplified to rely on **GitHub Actions for checks** and **Coolify for deployments**.

```
.github/
└── workflows/
    └── ci.yml              # Linting, typechecking, building
```

---

## 1. Continuous Integration (`ci.yml`)

**Purpose:** Validates code quality on every push and PR.

**Triggers:**

- Push to any branch
- Pull requests to `master` or `staging`

**Process:**

1. Checkout code
2. Setup Bun
3. **Backend:** Install deps, Generate Prisma (with dummy DB URL), Lint, Typecheck, Build
4. **Frontend:** Install deps, Build

**Note:** This ensures that no broken code makes it to deployment.

---

## 2. Deployments (Coolify GitHub App)

We use the **Coolify GitHub App** integration for zero-config deployments.

### Production

- **Trigger:** Push to `master` branch
- **Mechanism:** Coolify Git App receives push event -> Pulls code -> Builds image -> Deploys container
- **Configuration:** Managed in Coolify UI (Sources -> Git App)

### Staging / Dev

- **Trigger:** Push to `staging` branch (if configured in Coolify)

### Preview Deployments (Pull Requests)

- **Trigger:** Opening a Pull Request
- **Mechanism:** Coolify spins up a temporary environment for the PR (e.g., `pr-123.leadly.live`)
- **Cleanup:** Automatically destroyed when PR is closed/merged
- **Configuration:** enabled in Coolify -> Resource -> Advanced -> "Preview Deployments"

---

## Docker Compose Services

The `docker-compose.yml` defines 3 services:

| Service           | Purpose                  |
| ----------------- | ------------------------ |
| `leadly_backend`  | Express API server       |
| `leadly_frontend` | Next.js frontend         |
| `leadly_worker`   | BullMQ background worker |

**Proxy Handling:**

- Ports are NOT bound to host (no `ports:` section).
- Services use `expose:` to tell the proxy which port to route to.
- Coolify's proxy handles all traffic routing/SSL.

---

## Automatic Log Posting

Logs are sent to Discord automatically every hour:

| Service | Schedule  | What                   |
| ------- | --------- | ---------------------- |
| Backend | xx:00 UTC | Sends all backend logs |
| Worker  | xx:30 UTC | Sends all worker logs  |

Requires `DISCORD_LOGS_WEBHOOK_URL` environment variable.

---

## Database Migrations

**Automatically handled:**

- Dockerfile runs `bunx prisma migrate deploy` on startup
- CI uses dummy `DATABASE_URL` for Prisma generate

**No manual intervention needed for production migrations.**

---

## Troubleshooting

### CI Fails

```bash
cd backend && bun run lint && bun run typecheck && bun run build
cd frontend && bun run build
```

### Deployment Not Triggering

1. Check **Coolify -> Git Source -> GitHub App**: Verify permissions are valid (permissions for Content, Metadata).
2. Check **Repositoy Permissions** on GitHub: ensure the App has access to the repo.
3. If using Preview Deployments, ensure Env Vars are set for Preview in Coolify.
