---
title: System Identification
phase: sdd
status: active
owner: data-team
last_updated: 2026-05-24
---

# System Identification

## Basic Information

| Property | Value |
|----------|-------|
| **System Name** | Readmigo Dashboard |
| **Scope** | Admin operations analytics and content management single-page application (SPA) |
| **Version** | 0.1.0 |
| **Repository** | [github.com/readmigo/dashboard](https://github.com/readmigo/dashboard) |
| **Tech Stack** | React 18 + Vite 5 + TypeScript (strict) + react-admin v5 + MUI v6 + Recharts |
| **Node Runtime** | 20.x |
| **Package Manager** | pnpm |
| **Status** | `active` |
| **Owner** | `data-team` |
| **Last Updated** | 2026-05-24 |

## Purpose

The Readmigo Dashboard is a web-based admin portal providing:

- **Operations Analytics**: Real-time metrics on reading activity, audiobook consumption, subscription health, user engagement via PostHog HogQL integration
- **Content Management**: CRUD for books, authors, categories, quotes, bookmarks, reading lists
- **User Administration**: View user profiles, activity logs, reading statistics
- **Support Operations**: Ticket management, feedback processing, guest feedback reviews, issue triage
- **Infrastructure Monitoring**: Cost tracking across 13 services (compute, database, cache, storage, monitoring), budget visualization, performance tier comparison
- **Data Pipeline**: Staged import of Standardized E-book (SE) content via batch processing
- **Notifications**: Push notification composition and delivery tracking
- **Reporting**: Daily digest generation and business intelligence

## Related Documents

| Document | Path | Purpose |
|----------|------|---------|
| System Solution Architecture Description | [`docs/02-ssad/`](https://docs.readmigo.app/02-ssad) | High-level architecture decisions and technology strategy |
| Design Overview | `./design-overview.md` | System design approach and key decisions |
| Design Views | `./design-views.md` | Module, interface, data, and state architecture views |
| Design Rationale | `./design-rationale.md` | Justification for key design decisions |
| Design Language | `./design-language.md` | Type definitions, schemas, API contracts, error codes |
| Brand Design System | [`docs/02-design/design-system.md`](https://docs.readmigo.app/02-design/design-system) | Brand colors, tokens, and UI standards |
| PostHog Analytics | [`docs/05-operations/monitoring/posthog-dashboard-views.md`](https://docs.readmigo.app/05-operations/monitoring/posthog-dashboard-views) | Dashboard setup and HogQL queries |
| Deployment Pipeline | [`docs/05-operations/deployment/platforms/dashboard-deployment.md`](https://docs.readmigo.app/05-operations/deployment/platforms/dashboard-deployment) | CI/CD and environment configuration |

## Key Characteristics

### Architecture
- **Single Page Application (SPA)**: React + react-admin framework with client-side routing and component lifecycle management
- **Dual Data Source Pattern**: REST API (Readmigo backend) as primary/source-of-truth + PostHog HogQL for analytical queries
- **Design Token System**: Centralized brand colors and semantic tokens in `src/theme/brandTokens.ts` enforcing UI consistency; no hardcoded hex values permitted
- **Context API State Management**: 4 providers for Environment, Timezone, ContentLanguage, and ContentContext; localStorage persistence

### Development & Localization
- **TypeScript (strict mode)**: ES2020 target; strict null checks and type safety enforced
- **Multi-language Support**: English, Simplified Chinese, Traditional Chinese, German via `ra-i18n-polyglot`
- **Development Mode**: Environment switching (local vs. production) and mock authentication for offline testing
- **Component Library**: MUI v6 with Grid v1 API (no Grid v2 `size` prop)
- **Charting**: Recharts with 10-color palette from brandTokens

### Testing & Quality
- **E2E Testing**: Playwright test suite covering core user journeys (4 spec files: reading-stats, environment, ui-consistency, push-notifications)
- **No Unit Tests**: Services, config, and components currently tested only via E2E; no Vitest/Jest configured
- **API Mocking**: Playwright route interception for isolated E2E testing
- **Development Server**: Auto-starts on `http://localhost:3001` during test runs

### Deployment
- **Automated Deployment**: GitHub Actions workflow triggered on push to main branch
- **Build Pipeline**: `tsc && vite build` (strict type checking + production optimization)
- **API Environment Switching**: Seamless toggle between local (http://localhost:3000) and production (https://api.readmigo.app)
- **Feature Areas**: 25+ pages covering content, users, analytics, support, operations, cost management

