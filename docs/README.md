# Leadly Documentation Hub

This folder is the centralized source of truth for how Leadly is built today.

It covers:

- Product scope and feature set
- Backend architecture and execution model
- Frontend architecture and route structure
- Data model and code organization
- SEO, blog generation, and solutions landing pages
- Current engineering practices and repo conventions

## Recommended Reading Order

1. [Architecture](./architecture.md)
2. [Backend](./backend.md)
3. [Frontend](./frontend.md)
4. [Features](./features.md)
5. [SEO and Content Engine](./seo-content.md)
6. [Development Practices](./development-practices.md)

## Canonical Scope

These docs describe the implementation currently present in the repository under:

- `/backend`
- `/frontend`
- `/docker-compose.yml`

Where older docs conflict with code, prefer the code and these centralized docs.

## High-Level Summary

Leadly is a Bun-based monorepo with:

- A backend API built on Express 5, Prisma, PostgreSQL, Redis, BullMQ, and a Nebius-first AI provider chain
- A frontend built on Next.js 16 App Router, React 19, Tailwind CSS v4, and TanStack Query
- Two product modes:
  - ICP-based lead generation
  - Keyword-based Reddit monitoring
- A content layer:
  - AI-generated blog posts stored in the backend database
  - Programmatic SEO solution pages stored in a frontend JSON dataset

## Existing Non-Centralized Docs

These still exist in the repo, but this `docs/` folder should be treated as the main entry point:

- `/README.md`
- `/backend/API_REFERENCE.md`
- `/frontend/style-rules.md`
