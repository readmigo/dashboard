---
title: Design Overview
phase: sdd
status: active
owner: data-team
last_updated: 2026-05-24
---

# Design Overview

## Overall Approach

The Readmigo Dashboard follows a **layered SPA architecture** pattern combining data management, state management, and presentation layers:

```
User (Web Browser)
    ↓
[React-Admin UI Layer]
  - Custom pages (Dashboard, ReadingStats, Services, etc.)
  - Resource List/Edit/Show views
  - CRUD operations
    ↓
[Context API State Layer]
  - EnvironmentContext (local/production toggle)
  - TimezoneContext (user timezone)
  - ContentLanguageContext (i18n)
  - ContentContext (shared data)
    ↓
[Service Layer]
  - authProvider (JWT + mock dev mode)
  - dataProvider (REST client with dynamic env switching)
  - PostHog HogQL client (analytics queries)
    ↓
[API Contracts]
  - REST: /api/v1/admin/{resource}
  - PostHog: POST /api/projects/312868/query/
  - Headers: Bearer token, X-Admin-Mode, X-Content-Filter
```

**Design Philosophy**: Separation of concerns with unidirectional data flow. Components are presentational; business logic lives in services. Context API eliminates prop drilling. Environment configuration is centralized and testable.

## Key Design Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **react-admin v5 as framework** | Rapid CRUD scaffolding, built-in auth/i18n/routing, large community, reduces boilerplate | Opinionated component structure; less control over resource layout |
| **Context API over Redux** | Simpler mental model for 4 core contexts, no serialization overhead, built-in to React | Not optimal for highly frequent updates; less dev tooling for debugging |
| **Design Tokens (brandTokens.ts)** | Single source of truth; enforces brand consistency; enables dark mode/theme switching | Requires discipline not to hardcode colors; theme.ts must stay in sync |
| **Dual data sources (REST + PostHog)** | REST for CRUD/ground-truth; PostHog for behavioral analytics without overloading backend | Integration overhead; requires separate auth/query learning curve |
| **Playwright E2E only (no unit tests)** | Quick validation of real user workflows; catches integration bugs early | Low unit test coverage; slower feedback loop for bug fixes; high false negatives from mock data |
| **Environment switching in Context** | Dev teams easily toggle between local and production without config files | Risk of accidental production mutations if toggle is missed |
| **MUI v6 + Grid v1 API** | Mature, accessible, extensive component library; enterprise support | Larger bundle size (~1.2MB); limited customization without sx prop knowledge |
| **Recharts for analytics** | Lightweight, composable, good React integration; small bundle | Limited advanced features (no drill-down, limited axis customization) |

## Mapping to 02-ssad

This SDD implements the **Admin Dashboard** subsystem from the SSAD:

| SSAD Component | SDD Implementation | Details |
|---|---|---|
| **Admin Layer** | React-admin framework + custom pages | Resource management CRUD + custom routes for analytics dashboards |
| **Service Layer** | `src/services/` (authProvider, dataProvider) | HTTP client with dynamic env switching, mock auth for dev |
| **Data Layer** | REST API + PostHog HogQL | Dual sources: self-built APIs + analytics events |
| **Presentation** | React components + MUI theming | react-admin views, custom pages (ReadingStats, CostManagement, etc.) |
| **State** | Context API (4 providers) | No global store; lightweight context for environment, locale, timezone |
| **i18n** | ra-i18n-polyglot + LanguagePacks | EN, ZH-Hans, ZH-Hant, DE support |
| **Auth** | JWT sessionStorage + mock dev mode | Bearer token in Authorization header; dev mode bypass via VITE_AUTH_DISABLED |
| **Styling** | MUI theme + brandTokens | Centralized design tokens; MUI sx prop for overrides |

Related SSAD sections: [System Context](https://docs.readmigo.app/02-ssad/01-context-and-scope) (Admin APIs), [Building Blocks](https://docs.readmigo.app/02-ssad/05-building-blocks) (Service/Data layers).

