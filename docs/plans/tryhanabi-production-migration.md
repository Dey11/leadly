# Leadly production migration to tryhanabi.com

## Goal

Move the active Leadly product from the retired `leadly.live` and temporary
`leadly.sdey.me` hosts to:

- frontend: `https://leadly.tryhanabi.com`
- API: `https://api.leadly.tryhanabi.com`

The cutover must preserve production users, subscriptions, monitors, leads,
schedules, usage, and all 114 published blog posts. It must also leave a clear
rollback path until the new deployment is verified.

## Context

Cooldash currently has two Docker Compose applications in the Leadly production
environment:

- the retired `leadly.live` application, backed by a Cooldash-managed
  PostgreSQL database and live Dodo configuration
- the temporary `leadly.sdey.me` application, backed by a separate Neon
  database and test-mode Dodo configuration

The temporary database contains no users or product data. Its eight blog rows
all use slugs already present in the retired production database. The production
database exposes 114 published posts through the API.

The Leadly staging environment has no application. It contains one Redis
database that can be removed before deleting the empty environment.

`tryhanabi.com` uses Namecheap's authoritative DNS, not the Cloudflare account
available on this host. The required DNS records therefore need to be created by
the domain owner in Namecheap.

## Scope

- replace hard-coded `leadly.live` origins and cookie domains with deploy-time
  configuration
- make Google OAuth explicitly disableable and disable it for the new production
  deployment
- update canonical URLs, sitemap URLs, structured data, blog links, and generated
  content links to the new origin
- preserve password login and password reset for all users
- create a verified Resend sending domain for `leadly.tryhanabi.com` and move email
  senders to configurable addresses after DNS verification
- copy the retired production database into the target Neon database using a
  consistent PostgreSQL dump and restore
- move the live Dodo credentials to the target deployment and update its webhook
  endpoint
- configure the target Cooldash application for the new frontend and API domains
- remove the old application, temporary domains, staging Redis, and staging
  environment only after validation

## Non-goals

- changing product behavior, plans, prices, or subscription entitlements
- redesigning the marketing site or rewriting blog content
- deleting the retired production PostgreSQL database during the initial cutover
- attempting to transfer ranking signals without control of `leadly.live`

## Constraints

- Cooldash production resources must remain recoverable until validation passes.
- The repository deploys from `Dey11/leadly` on `master`; production cannot use
  local-only code.
- Namecheap DNS and Google Search Console require owner-side access that is not
  available in this workspace.
- Google OAuth-only accounts may need to use password reset after Google sign-in
  is disabled.
- The old domain no longer points to Leadly, so a same-path 301 redirect cannot be
  installed unless control of `leadly.live` is recovered.

## Chosen architecture

The existing `leadly.sdey.me` application remains the target Cooldash resource.
Its Neon database will receive a full logical copy of the production PostgreSQL
database. Keeping a distinct target database makes rollback explicit: the old
application and its database remain unchanged until the new deployment is
healthy.

Runtime origins and cookie scope become environment variables. This removes the
domain assumption from application code and makes future host changes a
configuration update rather than an auth refactor.

Google OAuth becomes a feature flag. When disabled, the frontend does not offer
Google sign-in and the backend rejects OAuth initiation. Password auth remains
available.

## Alternatives considered

### Point the target application at the old database

This avoids a data copy, but it couples the new deployment to the old Cooldash
database and makes rollback and later database ownership less clear. A verified
logical copy to the existing Neon target provides a cleaner boundary.

### Rename the old application instead

This is the shortest cutover but does not use the already isolated target
deployment requested for `leadly.tryhanabi.com`.

### Merge the eight temporary blog rows

All eight slugs already exist in the production database. Replacing production
versions with the temporary rows would also turn six currently published URLs
back into drafts, so the production versions remain authoritative.

## Implementation phases

### 1. Make the application domain-configurable

- add `COOKIE_DOMAIN`, `EMAIL_FROM`, `SECURITY_EMAIL_FROM`, and Google OAuth flags
- remove production cookie assumptions tied to `.leadly.live`
- hide and reject Google OAuth when disabled
- update SEO and generated-content origins to use the configured app URL
- update deployment examples and project documentation

### 2. Verify locally

- backend format, typecheck, focused tests, and build
- frontend format, typecheck, and build
- inspect the complete diff and commit the migration checkpoint

### 3. Prepare external services

- create the `leadly.tryhanabi.com` Resend sending domain and obtain its DNS records
- identify the active live Dodo webhook and verify its signing secret
- record the exact Namecheap records for frontend, API, and email

### 4. Copy production data

- stop or otherwise quiesce the old backend and worker for the final snapshot
- expose the source database only for the bounded export window if required
- take a PostgreSQL custom-format dump
- restore it into the target Neon database
- compare schema migrations and exact row counts for all application tables
- close any temporary database exposure

### 5. Cut over Cooldash

- update the target application's domains and production environment values
- copy the live Dodo configuration to the target
- set `GOOGLE_OAUTH_ENABLED=false`
- deploy the verified repository revision
- add the Namecheap A records for both new hosts
- wait for TLS and verify frontend, API health, auth, blogs, robots, sitemap, and
  billing return URLs
- update the Dodo webhook to
  `https://api.leadly.tryhanabi.com/api/v1/webhooks/dodo`

### 6. Retire obsolete resources

- remove the old `leadly.live` application after the rollback window closes
- retain its PostgreSQL database until a separate deletion decision
- remove the staging Redis database and then delete the empty staging environment
- remove the old `leadly.sdey.me` domain assignments

## Validation

- API `/health` reports connected PostgreSQL and Redis
- source and target table counts match after the final snapshot
- all 114 published blog slugs return successfully on the new host
- `/robots.txt`, `/sitemap.xml`, canonical metadata, Open Graph URLs, structured
  data, and `llms.txt` use the new origin
- registration, password login, session cookies, logout, password reset, and
  authenticated dashboard requests work across the frontend and API subdomains
- Google buttons are absent and OAuth endpoints do not initiate a flow
- Dodo creates live-mode checkout sessions with the new return URL
- Dodo webhook deliveries reach the new API and pass signature validation
- Resend sends from a verified `leadly.tryhanabi.com` address

## SEO migration notes

Moving from `leadly.live` to a subdomain of `tryhanabi.com` is a site move. The
content and URL paths can be preserved, but authority and Search Console history
do not automatically transfer. A permanent same-path redirect from the old
domain is the only reliable way to pass most existing signals. Without control
of that domain, the new host must be indexed as a new site.

After launch, submit `https://leadly.tryhanabi.com/sitemap.xml` in the
`tryhanabi.com` Search Console domain property, inspect representative blog URLs,
and request indexing. Keep all existing slugs unchanged and monitor indexing,
impressions, clicks, coverage, and canonical selection weekly.

## Risks

- DNS cannot be changed from this workspace because the available Cloudflare
  token does not own the Namecheap-hosted zone.
- Disabling Google OAuth can lock out accounts that never set a password. Password
  reset is the recovery path.
- A database copy taken while schedulers are writing can miss late changes. The
  final snapshot requires a brief write pause.
- Deleting the old domain configuration before TLS and app validation removes the
  fastest rollback path.

## Current status

Repository and infrastructure audit complete. The local implementation passes
backend formatting, type checking, tests, and build, plus the frontend type
check and production build with the new origins and Google OAuth disabled.

The `leadly.tryhanabi.com` sending domain now exists in Resend and is waiting for
its Namecheap DNS records. Cooldash production resources and the live Dodo brand
and webhook have not yet been changed.
