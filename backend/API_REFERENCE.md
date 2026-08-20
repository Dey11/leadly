# Leadly Backend Overview & API Reference

## Overview

Leadly's backend powers a lead-monitoring platform that watches user-defined sources (currently Reddit) and surfaces high-signal posts as actionable leads. The service is built with Express 5, Prisma, and PostgreSQL. It manages user accounts, subscriptions, ICP briefings (lead definitions), monitors for each ICP, scrape job history, and user-specific scheduling preferences. The ICP scheduler runs hourly, while the keyword scheduler runs hourly at minute 30.

All business APIs are versioned under `/api/v1`. Non-authentication routes require a valid session established through the authentication flow. Sessions are persisted in the database and delivered to clients via an HTTP-only `session_token` cookie.

## Conventions

- **Base URL:** `https://<backend-host>/api/v1`
- **Authentication:** Send the `session_token` cookie with every protected request.
- **Content-Type:** JSON (`application/json`) for request/response bodies unless otherwise noted.
- **Error format:** `{ "error": "<human readable message>" }`
- **Enums:** Values are aligned with Prisma schema
  - `Platform`: `REDDIT` (future platforms can be added)
  - `MonitorStatus`: `ACTIVE`, `PAUSED`, `ARCHIVED`
  - `ScrapeJobStatus`: `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`
- **IDs:** Treat primary identifiers as opaque strings. Newly created records use
  CUIDs (for example, `clyabc123...`), while migrated production records can use
  legacy prefixes such as `merged_monitors_...`.

## Authentication

### POST `/register`

- **Auth:** Public
- **Purpose:** Create a new user and issue a session.
- **Body:**
  ```json
  {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "password": "S3curePassw0rd"
  }
  ```
- **Success:** `201 Created`
  ```http
  Set-Cookie: session_token=<opaque>; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800
  ```
  ```json
  { "message": "User created successfully" }
  ```

### POST `/login`

- **Auth:** Public
- **Purpose:** Authenticate an existing user.
- **Body:**
  ```json
  {
    "email": "ada@example.com",
    "password": "S3curePassw0rd"
  }
  ```
- **Success:** `200 OK` with new session cookie
  ```json
  { "message": "Login successful" }
  ```

### POST `/logout`

- **Auth:** Session cookie required
- **Purpose:** Invalidate the active session.
- **Success:** `200 OK`
  ```http
  Set-Cookie: session_token=""; HttpOnly; SameSite=Lax; Path=/; Max-Age=0
  ```
  ```json
  { "message": "Logout successful" }
  ```

## Account

### GET `/account`

- **Auth:** Required
- **Purpose:** Fetch the signed-in user's profile summary.
- **Success:** `200 OK`
  ```json
  {
    "message": "User retrieved successfully",
    "payload": {
      "data": {
        "id": "cly7t4ncb0001xqz0k6b8gxo2",
        "name": "Ada Lovelace",
        "email": "ada@example.com",
        "emailVerified": false,
        "image": "https://cdn.example/avatar.png",
        "createdAt": "2024-03-06T12:15:30.123Z",
        "automation": {
          "enabled": true,
          "pausedForInactivity": false,
          "inactivityThresholdDays": 3
        }
      }
    }
  }
  ```

For free-tier accounts, authenticated product use updates the inactivity clock.
After three inactive days, `automation.pausedForInactivity` becomes `true` and
future ICP and keyword jobs remain disabled until explicitly re-enabled.

### POST `/account/automation/enable`

- **Auth:** Required
- **Purpose:** Re-enable future ICP and keyword jobs after a free-tier inactivity pause. Monitor and schedule definitions are preserved.
- **Success:** `200 OK`
  ```json
  {
    "message": "Future jobs enabled.",
    "payload": {
      "enabled": true,
      "pausedForInactivity": false,
      "inactivityThresholdDays": 3
    }
  }
  ```

### PATCH `/account`

- **Auth:** Required
- **Purpose:** Update profile name. Email, avatar, and password changes are currently disabled.
- **Body:**
  ```json
  {
    "name": "Ada L."
  }
  ```
- **Success:** `200 OK`
  ```json
  {
    "message": "Account updated successfully.",
    "payload": {
      "id": "cly7t4ncb0001xqz0k6b8gxo2",
      "name": "Ada L.",
      "email": "ada@example.com"
    }
  }
  ```

### DELETE `/account`

- **Auth:** Required
- **Purpose:** Soft-delete the user record (`isDeleted` set to `true`).
- **Success:** `200 OK`
  ```json
  {
    "message": "Account deleted successfully.",
    "payload": {}
  }
  ```

### GET `/account/sessions`

- **Auth:** Required
- **Purpose:** List active sessions for the user.
- **Success:** `200 OK`
  ```json
  {
    "message": "Active sessions retrieved.",
    "payload": [
      {
        "id": "clx3fox1c0000yprc4i35m1q5",
        "ipAddress": "203.0.113.5",
        "userAgent": "Chrome/123.0.0.0 (macOS)",
        "expiresAt": "2024-07-08T11:42:19.383Z"
      }
    ]
  }
  ```

## ICPs

ICPs describe the ideal customer profile briefing used to qualify leads.

### POST `/icps`

- **Auth:** Required
- **Purpose:** Create an ICP bound to the authenticated user.
- **Body:**
  ```json
  {
    "name": "Automation Agency ICP",
    "summary": "We sell done-for-you AI automations to growth-stage SaaS teams who struggle with manual onboarding and retention workflows.",
    "targetPersona": "Operators or founders at B2B SaaS companies (10-250 employees) owning RevOps or CX, typically in North America or Western Europe.",
    "pains": "Manual onboarding, repetitive support tasks, no internal automation talent, churn from slow response times, leadership pressure to do more with less.",
    "valueProposition": "We implement AI-first processes that reduce manual work by 60%+ and improve retention without hiring.",
    "qualifyingSignals": "Mentions of onboarding backlog, scaling support teams, struggling with manual workflows, interest in AI automation agencies.",
    "disqualifyingSignals": "Hobby projects, students, companies under $1k MRR, vendors pitching their own services, job seekers.",
    "platform": "REDDIT"
  }
  ```
- **Success:** `201 Created`
  ```json
  {
    "id": "clz1abc123002xqz0eq5h6zii",
    "userId": "cly7t4ncb0001xqz0k6b8gxo2",
    "name": "Automation Agency ICP",
    "summary": "We sell done-for-you AI automations to growth-stage SaaS teams who struggle with manual onboarding and retention workflows.",
    "targetPersona": "Operators or founders at B2B SaaS companies (10-250 employees) owning RevOps or CX, typically in North America or Western Europe.",
    "pains": "Manual onboarding, repetitive support tasks, no internal automation talent, churn from slow response times, leadership pressure to do more with less.",
    "valueProposition": "We implement AI-first processes that reduce manual work by 60%+ and improve retention without hiring.",
    "qualifyingSignals": "Mentions of onboarding backlog, scaling support teams, struggling with manual workflows, interest in AI automation agencies.",
    "disqualifyingSignals": "Hobby projects, students, companies under $1k MRR, vendors pitching their own services, job seekers.",
    "platform": "REDDIT",
    "status": "ACTIVE",
    "createdAt": "2024-06-10T12:25:08.215Z",
    "updatedAt": "2024-06-10T12:25:08.215Z"
  }
  ```

### GET `/icps`

- **Auth:** Required
- **Purpose:** List ICPs owned by the user, their monitors, and recent scrape jobs.
- **Success:** `200 OK`
  ```json
  [
    {
      "id": "clz1abc123002xqz0eq5h6zii",
      "userId": "cly7t4ncb0001xqz0k6b8gxo2",
      "name": "Automation Agency ICP",
      "summary": "We sell done-for-you AI automations to growth-stage SaaS teams who struggle with manual onboarding and retention workflows.",
      "targetPersona": "Operators or founders at B2B SaaS companies (10-250 employees) owning RevOps or CX, typically in North America or Western Europe.",
      "pains": "Manual onboarding, repetitive support tasks, no internal automation talent, churn from slow response times, leadership pressure to do more with less.",
      "valueProposition": "We implement AI-first processes that reduce manual work by 60%+ and improve retention without hiring.",
      "qualifyingSignals": "Mentions of onboarding backlog, scaling support teams, struggling with manual workflows, interest in AI automation agencies.",
      "disqualifyingSignals": "Hobby projects, students, companies under $1k MRR, vendors pitching their own services, job seekers.",
      "platform": "REDDIT",
      "status": "ACTIVE",
      "createdAt": "2024-06-10T12:25:08.215Z",
      "updatedAt": "2024-06-10T12:25:08.215Z",
      "monitors": [
        {
          "id": "clz1tx3pt0003xqz0b9c5ludu",
          "icpId": "clz1abc123002xqz0eq5h6zii",
          "platform": "REDDIT",
          "target": "r/EntrepreneurRideAlong",
          "cursor": "t3_1ab2c3",
          "status": "ACTIVE",
          "lastScrapedAt": "2024-06-10T13:00:00.000Z",
          "createdAt": "2024-06-10T12:29:17.901Z",
          "updatedAt": "2024-06-10T13:00:00.000Z",
          "userId": "cly7t4ncb0001xqz0k6b8gxo2",
          "scrapeJobs": [
            {
              "id": "clz1ug9nz0004xqz0p0ya7xw3",
              "monitorId": "clz1tx3pt0003xqz0b9c5ludu",
              "status": "COMPLETED",
              "warmLeads": 3,
              "coldLeads": 5,
              "neutralLeads": 1,
              "metadata": null,
              "startedAt": "2024-06-10T12:45:00.000Z",
              "completedAt": "2024-06-10T12:59:55.000Z",
              "createdAt": "2024-06-10T12:45:00.000Z",
              "errorMessage": null
            }
          ]
        }
      ]
    }
  ]
  ```
  > Currently all `scrapeJobs` per monitor are returned (no pagination cap yet).

### GET `/icps/:id`

- **Auth:** Required
- **Purpose:** Fetch a single ICP with monitors + scrape jobs.
- **Success:** `200 OK` with the same shape as `GET /icps`.

### PATCH `/icps/:id`

- **Auth:** Required
- **Purpose:** Update any ICP field.
- **Body (any subset):**
  ```json
  {
    "summary": "We sell done-for-you AI automations to RevOps leaders at PLG SaaS companies (20-200 FTE).",
    "status": "PAUSED"
  }
  ```
- **Success:** `200 OK` returning the updated ICP object.

### DELETE `/icps/:id`

- **Auth:** Required
- **Purpose:** Remove an ICP (all downstream monitors, jobs, and leads cascade automatically).
- **Success:** `200 OK`
  ```json
  { "success": true }
  ```
- **Failure cases:** `403` if the ICP belongs to another user, `404` if not found.

## Monitors

Monitors describe specific sources (e.g., a subreddit) to watch for an ICP. Users are restricted by tier limits (`TIER_LIMITS`).

### POST `/monitors`

- **Auth:** Required
- **Purpose:** Create a monitor under an existing ICP owned by the user.
- **Body:**
  ```json
  {
    "icpId": "clz1abc123002xqz0eq5h6zii",
    "platform": "REDDIT",
    "target": "r/EntrepreneurRideAlong",
    "cursor": null
  }
  ```
- **Success:** `201 Created` with the monitor record.
- **Failure cases:**
  - `400` if validation fails, the ICP is missing, or tier monitor limit reached.
  - `400` if user lacks an active subscription (no `subscription` row).
  - `409` if the same ICP already monitors the normalized target. Target
    identity is case-insensitive and ignores surrounding whitespace.

### GET `/monitors`

- **Auth:** Required
- **Purpose:** List all monitors owned by the user. Includes parent ICP and last 10 scrape jobs.
- **Success:** `200 OK` returning an array shaped like the `monitors` entries shown under `GET /icps`.

### PUT `/monitors/:id`

- **Auth:** Required
- **Purpose:** Replace monitor fields (partial updates allowed via schema).
- **Body (any subset):**
  ```json
  {
    "icpId": "clz1abc123002xqz0eq5h6zii",
    "target": "r/SaaS",
    "status": "PAUSED",
    "cursor": "t3_1b4c6d"
  }
  ```
- **Success:** `200 OK` with updated monitor record.

### DELETE `/monitors/:id`

- **Auth:** Required
- **Purpose:** Remove a monitor.
- **Success:** `200 OK`
  ```json
  { "success": true }
  ```

## Schedule

Scheduling controls when scrapes run for a user. Tiers cap the number of selectable hours (`TIER_LIMITS[tier].selectableHours`). Absent schedules are auto-created with defaults (`DEFAULT_HOURS_MAP`).

### GET `/schedule`

- **Auth:** Required
- **Purpose:** Fetch the user's schedule; creates a default if missing.
- **Success:** `200 OK`
  ```json
  {
    "id": "cly84g4ni0005xqz0z7kb11om",
    "userId": "cly7t4ncb0001xqz0k6b8gxo2",
    "scheduledHours": [12],
    "createdAt": "2024-03-06T12:15:30.123Z",
    "updatedAt": "2024-03-06T12:15:30.123Z"
  }
  ```

### PATCH `/schedule`

- **Auth:** Required
- **Purpose:** Update schedule hours (0–23, unique). The backend enforces tier limits and normalizes missing schedules.
- **Body:**
  ```json
  {
    "scheduledHours": [4, 8, 12, 16, 20]
  }
  ```
- **Success:** `200 OK` with the upserted schedule object.

### GET `/schedule/limits`

- **Auth:** Required
- **Purpose:** Retrieve the user's subscription tier, applicable limits, and current schedule (if any).
- **Success:** `200 OK`
  ```json
  {
    "tier": "PRO",
    "limits": {
      "monitors": 6,
      "scrapesPerDay": 6,
      "selectableHours": 6
    },
    "currentSchedule": {
      "id": "cly84g4ni0005xqz0z7kb11om",
      "userId": "cly7t4ncb0001xqz0k6b8gxo2",
      "scheduledHours": [4, 8, 12, 16, 20],
      "createdAt": "2024-03-06T12:15:30.123Z",
      "updatedAt": "2024-03-06T13:15:30.123Z"
    }
  }
  ```
- **Failure:** `400` if the user has no active subscription.

## Leads

Leads represent individual posts or content that have been identified as potential business opportunities through the scraping process.

### GET `/leads`

- **Auth:** Required
- **Purpose:** Retrieve a paginated list of all leads for the user, with optional filtering.
- **Query Parameters:**
  - `monitorId?: string` - Filter by specific monitor
  - `platform?: "REDDIT"` - Filter by platform (currently only Reddit supported)
  - `leadType?: "WARM" | "COLD" | "NEUTRAL"` - Filter by lead type
  - `status?: "NEW" | "VIEWED" | "CONTACTED" | "ARCHIVED"` - Filter by status
  - `page?: number` (default: 1) - Page number for pagination
  - `limit?: number` (default: 20, max: 100) - Number of leads per page
- **Success:** `200 OK`
  ```json
  {
    "message": "Leads retrieved successfully.",
    "payload": {
      "data": [
        {
          "id": "clyabc123def456ghi789",
          "platform": "REDDIT",
          "leadType": "WARM",
          "content": "My SaaS is having a hard time with churn...",
          "url": "https://reddit.com/r/saas/comments/...",
          "author": "some_user",
          "status": "NEW",
          "createdAt": "2024-03-06T14:00:00.000Z"
        }
      ],
      "pagination": {
        "total": 150,
        "page": 1,
        "limit": 20,
        "totalPages": 8
      }
    }
  }
  ```

### GET `/leads/:leadId`

- **Auth:** Required
- **Purpose:** Retrieve the details of a single lead.
- **Path Parameters:** `leadId: string`
- **Success:** `200 OK`
  ```json
  {
    "message": "Lead details retrieved successfully.",
    "payload": {
      "id": "clyabc123def456ghi789",
      "platform": "REDDIT",
      "leadType": "WARM",
      "content": "My SaaS is having a hard time with churn. Any advice on...",
      "url": "https://reddit.com/r/saas/comments/...",
      "author": "some_user",
      "status": "VIEWED",
      "reasoning": "The user explicitly mentions 'churn' and is asking for help with their SaaS business.",
      "createdAt": "2024-03-06T14:00:00.000Z"
    }
  }
  ```
- **Side effect:** When a lead is fetched and its status is `NEW`, it is immediately updated to `VIEWED` on the backend.
- **Failure cases:** `404` if lead not found, `403` if not owned by user.

### PATCH `/leads/:leadId`

- **Auth:** Required
- **Purpose:** Update the status of a single lead.
- **Path Parameters:** `leadId: string`
- **Body:**
  ```json
  {
    "status": "CONTACTED"
  }
  ```
- **Success:** `200 OK`
  ```json
  {
    "message": "Lead updated successfully.",
    "payload": {
      "id": "clyabc123def456ghi789",
      "status": "CONTACTED"
    }
  }
  ```
- **Failure cases:** `400` if invalid status, `404` if lead not found, `403` if not owned by user.

### DELETE `/leads/:leadId`

- **Auth:** Required
- **Purpose:** Permanently delete a single lead. Use with caution.
- **Path Parameters:** `leadId: string`
- **Success:** `200 OK`
  ```json
  {
    "message": "Lead deleted successfully.",
    "payload": {}
  }
  ```
- **Failure cases:** `404` if lead not found, `403` if not owned by user.

## Scrape Jobs

Scrape jobs represent the execution history of monitoring tasks for specific monitors.

### GET `/monitors/:monitorId/jobs`

- **Auth:** Required
- **Purpose:** Retrieve the execution history of scrape jobs for a specific monitor.
- **Path Parameters:** `monitorId: string`
- **Query Parameters:**
  - `page?: number` (default: 1) - Page number for pagination
  - `limit?: number` (default: 15, max: 100) - Number of jobs per page
- **Success:** `200 OK`
  ```json
  {
    "message": "Scrape jobs retrieved successfully.",
    "payload": {
      "data": [
        {
          "id": "clydef456ghi789jkl012",
          "status": "COMPLETED",
          "warmLeads": 3,
          "coldLeads": 5,
          "neutralLeads": 1,
          "leadCount": 9,
          "startedAt": "2024-03-06T12:45:00.000Z",
          "completedAt": "2024-03-06T12:59:55.000Z",
          "createdAt": "2024-03-06T12:45:00.000Z"
        }
      ],
      "pagination": {
        "total": 25,
        "page": 1,
        "limit": 15,
        "totalPages": 2
      }
    }
  }
  ```
- **Failure cases:** `404` if monitor not found, `403` if not owned by user.

## Additional Notes for Frontend Integration

- Set `credentials: "include"` on `fetch`/XHR requests to carry the session cookie.
- Handle `401` responses by redirecting to login and clearing local state.
- When creating services or monitors, surface validation errors from the backend verbatim—they carry actionable detail (e.g., tier limits).
- Prisma timestamps are ISO strings; convert to local timezones in UI as needed.
- The backend currently supports only Reddit (`Platform.REDDIT`), but the enum makes it easy to add more platforms later—plan UI accordingly.
- Lead filtering supports multiple criteria that can be combined for precise results.
- Scrape job history includes aggregated lead counts and credit consumption for monitoring usage.
