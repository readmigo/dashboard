---
title: Product Requirements Document
phase: req
status: active
owner: data-team
last_updated: 2026-05-24
---

# Product Requirements Document

## Goals & value proposition

Enable the Readmigo operations team to make data-driven decisions through real-time, multi-dimensional visualizations of user behavior, book performance, subscription revenue, and content metrics. Replace ad-hoc SQL queries and manual spreadsheets with an integrated dashboard that consolidates PostHog analytics, the Readmigo API, and operational workflows in a single web interface.

**Core value drivers:**
- Reduce decision latency from hours (manual reports) to seconds (live dashboards)
- Enable non-technical PMs and content managers to self-serve analytics without SQL knowledge
- Centralize CRUD operations for 12+ resource types (books, users, quotes, etc.) in one system
- Provide timezone-aware and language-filtered data for multi-regional operations
- Monitor real-time KPIs: DAU/MAU, retention, subscription conversion, push notification performance

## Scope

### In Scope

**Analytics Dashboards (6 total):**
- Main Dashboard: KPI overview (DAU, MAU, signups, revenue, active subscriptions)
- Reading Stats: Book rankings, user engagement, category performance, time heatmaps
- Daily Report: Trending metrics with day-over-day and week-over-week comparisons
- Subscription Dashboard: Subscription breakdown, paywall→purchase conversion funnel
- Highlight Analytics: PostHog-powered user highlight tracking (HogQL queries)
- Cost Management: 13 Readmigo services with cost tracking and 4-year TCO projection

**CRUD Management (12 Resource Types):** Books, authors, booklists, categories, users, quotes, messages, guest feedback, import batches, tickets, feedback, orders

**Operational Features:**
- Push Notifications: Send to user segments, view delivery history and click metrics
- SE Import: Standard Ebooks 4-node incremental import pipeline (calc → parse → populate → discover)
- Service Hub: Centralized navigation to PostHog, Sentry, Vercel, Supabase, and other Readmigo services
- Support Dashboard: Ticket and guest feedback aggregation

**Multi-User & Localization Support:**
- Multi-environment switching: local dev ↔ production (instant API endpoint swap)
- Timezone support: 6 timezones (Shanghai, Tokyo, New York, LA, London, UTC)
- Content language filter: English / Chinese / All
- Internationalization: English, Simplified Chinese, Traditional Chinese, German
- Multi-device support: Desktop browsers (Chrome, Firefox, Safari, Edge)

**Developer Experience:**
- Global debug logging system (window.__DEBUG_LOG__, 200 entry ring buffer)
- Error tracking via Sentry integration
- Auth: JWT-based admin login with dev mode auto-login capability

### Out of Scope

- User-facing (player) analytics on mobile apps (iOS/Android SDK handled separately)
- Real-time event ingestion infrastructure (handled by PostHog)
- API endpoint design or modification (consumes existing Readmigo API)
- Marketing website or public-facing analytics portal
- Custom visualization library (uses Recharts charting)

## Key features

### Analytics & Reporting Dashboards (6 modules)

| Dashboard | Purpose | Key Metrics | Data Source |
|-----------|---------|-------------|-------------|
| **Main Dashboard** | Executive overview and KPI tracking | DAU, MAU, signups, MRR, subscriptions | PostHog, Readmigo API |
| **Reading Stats** | Book and content performance analysis | Top 50 books, author rankings, category trends, time heatmap | PostHog HogQL |
| **Daily Report** | Day-over-day and week-over-week trends | YoY deltas, % change, trending indicators | PostHog aggregations |
| **Subscription Dashboard** | Revenue and conversion funnel tracking | Paywall views, purchase conversion, ARPU, MRR, LTV | PostHog subscription events |
| **Highlight Analytics** | User annotation (highlight) activity tracking | Highlight creation, reading progress correlation | PostHog custom events |
| **Cost Management** | Service cost and budget tracking | 13 service expenses, $400/mo budget, 4-year TCO | Manual config + projections |

### Content & User Management (12 resource types via CRUD UI)

- **Books**: Create, read, update, delete book metadata
- **Authors**: Author profile and relationship management
- **Booklists**: Curated book collection management
- **Categories**: Content categorization and tagging
- **Users**: User profile admin, suspension, role management
- **Quotes**: Highlight quotes and user-generated content management
- **Messages**: In-app notification and message administration
- **Guest Feedback**: Public feedback form submission management
- **Import Batches**: Standard Ebooks import pipeline monitoring
- **Tickets**: Support ticket triage and resolution tracking
- **Feedback**: In-app feedback aggregation and prioritization
- **Orders**: Subscription and transaction history

### Operational Tools (3 modules)

| Tool | Function | Users |
|------|----------|-------|
| **Push Notifications** | Send targeted messages to user segments, track delivery, view click history | Ops, Growth |
| **SE Import** | Trigger and monitor Standard Ebooks 4-node import pipeline | Content team |
| **Service Hub** | Navigation hub linking to all Readmigo microservices | All admins |

### Multi-Dimensional Data Filtering

- **Environment Selection**: Instant switching between local (localhost:3000) and production (api.readmigo.app) endpoints
- **Timezone Awareness**: 6 configurable timezones (Shanghai, Tokyo, New York, LA, London, UTC) for consistent date aggregations
- **Content Language Filter**: Analytics and list views filterable by user locale (English / Chinese / All)
- **UI Localization**: 4 interface languages (English, Simplified Chinese, Traditional Chinese, German)

### Developer & Operations Tools

- **Debug Logging**: Global `window.__DEBUG_LOG__` ring buffer with 200 entry capacity; auto-capture of API calls, errors, and state changes
- **Global Error Boundary**: Fallback UI for uncaught errors with error reporting to Sentry
- **Sentry Integration**: Automatic error tracking, source map support, release tracking

## Constraints & dependencies

### Technology Constraints

- **Browser-based SPA**: No server-side rendering; build artifact is static asset bundle
- **Build system**: Vite 5 (full rebuild ~20 seconds)
- **React version lock**: React 18.3.1 (react-admin v5 requires 18.x)
- **UI framework**: MUI v6 (Material UI) with sx prop for all styling; no CSS Modules or Tailwind
- **Charting library**: Recharts (limited D3 customization; use provided `chartPalette` from brandTokens)
- **react-admin version**: v5.3.0 (frozen; upstream maintenance only)
- **PostHog HogQL API**: Rate limit 120 requests/minute per project ID

### Data Dependencies

- **PostHog Instance**: Project ID 312868 with API key requiring Dashboard:Write and Insight:Read permissions
- **Readmigo API**: `api.readmigo.app` on Fly.io; requires JWT auth token; CRUD endpoints for 12+ resource types
- **Sentry Instance**: Error event ingestion from frontend (JS) and backend services
- **Internal Test User IDs**: 4 hardcoded UUIDs excluded from analytics to prevent test data pollution:
  - `88952c83-83f1-4bdc-a7a0-85f3c3e4c2ab` (iOS multi-device)
  - `a14b013d-fd4c-4f23-91e0-41e0dcf92417` (Android Pixel 3a)
  - `7ca8da67-4861-4267-a1b5-be3b357b438d` (Android OnePlus 8Pro)
  - `88c99ab9-4f25-52cc-8999-3e58d559ec41` (iOS iPhone 11 Pro Max)

### Browser & Platform Constraints

- **Target browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **JavaScript timezone**: Relies on browser Date API; no server-side timezone conversion
- **Persistence**: LocalStorage for environment, timezone, language user preferences
- **No mobile optimization**: Desktop-only UI (iPad Safari not officially tested)

### External Service Dependencies

- **PostHog**: HogQL query engine, event schema validation, API availability
- **Readmigo API**: Admin auth, CRUD operation validation, rate limiting
- **Sentry**: Error ingestion and alerting; may have quota limits
- **Vercel / GitHub Pages**: Static hosting and CI/CD deployment

### Operational Constraints

- Dashboard must not block Readmigo feature releases (independent service)
- Admin login credentials required; no public-facing analytics portal
- Bulk operations via UI should not exceed API rate limits (batch sizes ≤ 100 records)
- Import batches are long-running (30+ minutes); UI must implement polling with exponential backoff
- PostHog query performance degrades with large time windows (>180 days); optimize query ranges

### Related Documentation

- Architecture & system design: `/Users/HONGBGU/Documents/readmigo-repos/docs/03-architecture/`
- Design tokens & theming: `src/theme/brandTokens.ts`
- PostHog query templates: `src/config/posthog-queries.ts`
- API contracts: https://docs.readmigo.app/04-development/api-reference/
- Analytics SOP: https://docs.readmigo.app/05-operations/monitoring/operations-analysis-playbook

