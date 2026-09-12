# Leadly Features

## Product Modes

Leadly currently exposes two main product tracks.

## 1. ICP-Based Lead Generation

This is the AI-qualified lead discovery workflow.

Core capabilities:

- create and manage ICPs
- define summary, persona, pains, value proposition, qualifying signals, and disqualifying signals
- attach subreddit monitors to each ICP
- schedule monitoring hours
- run AI qualification against scraped Reddit content
- classify leads by type
- store reasoning and generated outreach
- export lead data

User-visible surfaces:

- dashboard overview
- ICP management
- monitor management
- leads list and lead detail
- scrape job history per monitor
- AI-generated DM flow

## 2. Keyword Monitoring

This is the mention and keyword-match workflow.

Core capabilities:

- create keyword sets
- enable exact or fuzzy keyword matching
- attach keyword monitors to targets
- schedule keyword monitoring hours
- review keyword matches
- export keyword leads
- inspect keyword activity stats

User-visible surfaces:

- keyword sets
- keyword monitors
- keyword matches
- keyword statistics

## User and Account Features

- registration and login
- logout
- email verification
- resend verification email
- forgot/reset password
- Google OAuth login
- profile editing
- session visibility
- account deletion
- walkthrough tracking
- onboarding state tracking
- stored company, occupation, referrer, and sample DM profile fields

## Billing and Usage Features

- subscription purchase
- plan-change preview
- billing portal management
- subscription cancellation
- usage accounting
- plan-based quota enforcement

Current tier system in code:

- `FREE`
- `PRO`
- `PREMIUM`

Usage is enforced for both lead-generation scrapes and keyword scrapes.

Free-tier automation pauses after three consecutive days without authenticated
product activity. Monitor and schedule definitions remain intact. The first
dashboard visit after the pause shows an “Enable jobs again” banner; the action
resumes future ICP and keyword jobs. Paid tiers are exempt.

Administrative automation pauses are distinct from inactivity pauses and can
stop future jobs for every tier without changing subscription entitlements,
monitors, or schedules. The same banner lets an active returning user resume.

## AI-Assisted Features

All AI-assisted features use Nebius DeepSeek V4 Flash first. Google Gemini is
the active automatic fallback. Cerebras and WaveSpeed remain configured but are
disabled until their production accounts are usable.

- ICP suggestion
- subreddit suggestion for monitors
- subreddit suggestion for keyword monitors
- AI qualification of Reddit posts against ICPs
- AI-generated direct messages for leads
- AI-generated blog content
- AI-generated metadata for blog posts
- AI-generated solutions page data

## Content and Growth Features

- public marketing homepage
- blog index and blog article pages
- programmatic solution landing pages by role/industry
- metadata generation
- sitemap generation
- robots generation
- structured data on homepage

## Operational Features

- health endpoint
- admin log delivery endpoint
- Discord log shipping
- bug report creation and listing
- webhook ingestion for billing events
- stuck-job recovery
- failed-job retry logic

## Data Stored for Product Behavior

- users and sessions
- subscriptions and usage
- ICPs and monitors
- scrape jobs and leads
- keyword sets, monitors, jobs, and keyword leads
- bug reports
- webhook events
- blog posts

## What the Product Is Optimized For

The current implementation is optimized around:

- Reddit as the acquisition and monitoring channel
- sales and founder workflows
- B2B lead qualification
- async scraping and AI filtering
- programmatic SEO growth loops through blog and role-based landing pages
