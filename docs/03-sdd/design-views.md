---
title: Design Views
phase: sdd
status: active
owner: data-team
last_updated: 2026-05-24
---

# Design Views (4+1 Model)

## Interface View (Routes & API Endpoints)

### Route Map (react-router + react-admin)

| Route | Component | Features | API Endpoints |
|-------|-----------|----------|---------------|
| `/` | Dashboard | Overview cards, trend charts | `/admin/operations/overview`, PostHog queries |
| `/books` | BookList/Edit/Show | CRUD for books | `GET/POST/PATCH/DELETE /admin/books` |
| `/users` | UserList/Show | User profiles, activity | `GET /admin/users` |
| `/reading-stats` | ReadingStatsPage | Analytics dashboards (tabs: Books, Users, Categories, TimePatterns) | `/admin/reading-stats/*` |
| `/support-dashboard` | SupportDashboard | Ticket + feedback summary | `/admin/tickets`, `/admin/feedback` |
| `/services` | ServiceHub | Service list with real-time costs | PostHog custom events |
| `/cost-management` | CostManagementPage | Budget tracking per service/category | Config from `costConfig.ts` |
| `/push-notifications` | PushNotificationsPage | Compose and send notifications | `POST /admin/push-notifications` |
| `/categories` | CategoryList/Edit | Content categories | `GET/POST/PATCH /admin/categories` |
| `/authors` | AuthorList/Edit/Show | Author management | `GET/POST/PATCH /admin/authors` |
| `/quotes`, `/messages`, `/feedback`, `/orders` | *List/Show | Various resources | Standard CRUD endpoints |

### Consumed API Contracts

**Authentication**:
```
POST /api/v1/admin/auth/login
  ← { email, password }
  → { accessToken, user { id, displayName, roles, avatarUrl } }
Header: Authorization: Bearer {accessToken}
```

**Resource CRUD** (all use `/api/v1/admin/{resource}`):
```
GET    /api/v1/admin/{resource}?page=1&limit=10&sortBy=id&sortOrder=DESC
  → { items: [...], total: N }
GET    /api/v1/admin/{resource}/{id}
  → { id, createdAt, updatedAt, ... }
POST   /api/v1/admin/{resource}
  ← { ...data }
  → { id, createdAt, ... }
PATCH  /api/v1/admin/{resource}/{id}
  ← { ...updateFields }
  → { id, updatedAt, ... }
DELETE /api/v1/admin/{resource}/{id}
  → { id }
```

**Analytics** (PostHog):
```
POST /api/projects/312868/query/
  ← { query: { kind: "HogQLQuery", query: "SELECT ..." } }
  → { results: [...], timings: {...} }
Header: Authorization: Bearer {personalApiKey}
```

---

## Module View (Component Architecture)

```
src/
├── pages/                      # 25+ feature pages
│   ├── Dashboard.tsx           # Main dashboard with overview stats
│   ├── reading-stats/          # ReadingStatsPage (tabs for books/users/categories/time-patterns)
│   ├── support/                # SupportDashboard (tickets + feedback)
│   ├── services/               # ServiceHub (service metrics)
│   ├── CostManagement.tsx      # Cost tracking & budget alerts
│   ├── push-notifications/     # Push notification composer
│   ├── daily-report/           # Daily digest builder
│   ├── highlight-analytics/    # Highlight & annotation analytics
│   └── books/, users/, etc.    # CRUD pages for content resources
├── services/
│   ├── authProvider.ts         # JWT auth + mock dev mode
│   ├── dataProvider.ts         # REST client (dynamic env, debug logging)
│   ├── posthogClient.ts        # (if exists) PostHog query wrapper
│   └── [others]/               # Feature-specific services
├── contexts/                   # State providers
│   ├── EnvironmentContext.tsx  # local | production toggle
│   ├── TimezoneContext.tsx     # User timezone offset
│   ├── ContentLanguageContext  # i18n language filter
│   └── ContentContext.tsx      # Shared data (if needed)
├── config/
│   ├── environments.ts         # API URLs, feature flags
│   ├── posthog-queries.ts      # HogQL query templates (18.5KB, 12 categories)
│   ├── analytics-config.ts     # PostHog project ID, dashboards, events
│   ├── costConfig.ts           # Service definitions, budgets, costs
│   └── [others]/               # Feature configs
├── theme/
│   ├── brandTokens.ts          # Colors, shadows, radii, chartPalette
│   ├── chartColors.ts          # (alias or re-export from brandTokens)
│   └── index.ts                # MUI theme object
├── components/
│   ├── common/
│   │   ├── StatCard.tsx        # Reusable stat display
│   │   ├── TrendChart.tsx      # Reusable trend visualization
│   │   └── [others]/
│   ├── CustomLayout.tsx        # react-admin layout override
│   ├── CustomAppBar.tsx        # Navbar with env switcher
│   ├── CustomMenu.tsx          # Sidebar navigation
│   └── GlobalErrorBoundary.tsx # Error handling
├── hooks/                      # Custom React hooks
├── i18n/                       # Localization
│   ├── en.ts, zh-Hans.ts, etc. # Language packs (resource labels)
│   └── index.ts                # ra-i18n-polyglot setup
├── App.tsx                     # Root: Admin + Providers
└── main.tsx                    # Vite entry point
```

**Key Dependencies**:
- `react-admin` (v5.3.0): CRUD framework, routing, auth/i18n integration
- `@mui/material` (v6.1.0): 60+ components (Card, Table, Dialog, etc.)
- `@mui/icons-material` (v6.1.0): 1000+ icons
- `recharts` (v2.13.0): Chart library
- `ra-i18n-polyglot` (v5.3.0): i18n provider
- `ra-language-chinese`: Built-in Chinese translations for react-admin

---

## Data View (Event & Resource Schemas)

### PostHog Events Tracked

| Category | Event Name | Tracked Fields | Sample |
|----------|-----------|---|---|
| **Reading** | `reading_started`, `reading_session_ended`, `chapter_navigated` | book_id, duration_sec, chapter | User opened book X, read Y chapters |
| **Audiobook** | `audiobook_play_started`, `audiobook_play_ended`, `tts_audiobook_voice_changed` | audiobook_source (librivox\|tts_v3), voice_id, duration | Playing TTS voice with voice_id=Z |
| **User** | `user_signup`, `user_logged_in`, `user_logout` | email, signup_source | User signed up via iOS |
| **Subscription** | `subscription_purchased`, `paywallViewed` | plan, price_usd | Purchased annual plan $99 |

### REST Resource Schemas (from dataProvider.ts)

| Resource | Response Envelope | Item Example |
|----------|---|---|
| `books` | `{ items: [...], total: N }` | `{ id, title, author, coverUrl, publish_date, createdAt, updatedAt }` |
| `users` | `{ items: [...], total: N }` | `{ id, email, displayName, locale, createdAt, last_login }` |
| `reading-stats/books` | `{ items: [...], total: N }` | `{ rank, bookId, title, totalReadingSeconds, uniqueReaders, ... }` |
| `reading-stats/overview` | Direct object | `{ totalReadingSeconds, totalSessions, activeReaders, booksBeingRead, averageSessionDuration, averageDailySeconds }` |
| `tickets` | `{ tickets: [...], total: N }` | `{ id, userId, status, subject, createdAt, messages: [...] }` |
| `feedback` | `{ feedbacks: [...], total: N }` | `{ id, userId, rating, content, createdAt, resolved }` |
| `orders` | `{ orders: [...], total: N }` | `{ id, userId, product_id, price_usd, status, createdAt }` |

### Data Flow Example (Reading Stats Page)

1. User navigates to `/reading-stats`
2. ReadingStatsPage component mounted
3. `dataProvider.getOne('reading-stats/overview')` fires
4. Fetch: `GET /api/v1/admin/reading-stats/overview` (includes `X-Content-Filter: en` header)
5. Response: `{ totalReadingSeconds: 740700, ... }` (seconds from backend)
6. Component converts: `740700 ÷ 60 = 12,345 minutes` for display
7. Parallel: `dataProvider.getList('reading-stats/books', { ... })` fetches ranked books
8. Chart data formatted; StatCard component renders with converted values

---

## State View (Context API Architecture)

### 1. EnvironmentContext
```
State:
  - environment: 'local' | 'production' (persisted to localStorage)
  - apiBaseUrl: 'http://localhost:3000' | 'https://api.readmigo.app'
  - isLoading: boolean (UI feedback during switch)
  - config: { name, apiUrl, color, description, requireConfirmation }

Consumers:
  - dataProvider (reads apiBaseUrl for REST calls)
  - CustomAppBar (env switcher button)
  - costConfig (optional dev env notice)

Event:
  - Dispatches 'environment-changed' custom event for dataProvider to react
```

### 2. TimezoneContext
```
State:
  - timezone: string (e.g., 'Asia/Tokyo', from user profile or browser)

Consumers:
  - ReadingStatsPage (format timestamps in user's timezone)
  - DailyReportPage (schedule reports in user's timezone)
```

### 3. ContentLanguageContext
```
State:
  - contentLanguage: 'all' | 'en' | 'zh' (persisted to sessionStorage)

Consumers:
  - dataProvider (sends X-Content-Filter header)
  - CustomAppBar (language filter dropdown)
  - book/category pages (conditional rendering)

Behavior:
  - Resources WITHOUT filter: tickets, feedback, orders, support-dashboard, messages
  - Resources WITH filter: books, authors, categories, quotes (language-specific content)
```

### 4. ContentContext (optional, extensible)
```
State: (to be defined per feature need)
  - currentBook: { id, title, ... } | null
  - selectedCategories: string[]
  - filters: { dateRange, status, ... }

Purpose: Share derived data between multiple pages without prop drilling
```

### localStorage & sessionStorage Persistence

| Key | Scope | Lifetime | Example |
|-----|-------|----------|---------|
| `dashboard_environment` | localStorage | Indefinite | `'production'` |
| `adminToken` | sessionStorage | Browser session | `'eyJhbGc...'` (JWT) |
| `adminUser` | sessionStorage | Browser session | `{ id, email, displayName, roles }` |

---

## Deployment View (not in 4+1, but relevant)

### Build Pipeline
```
Source (GitHub main branch)
  ↓ (Push trigger)
GitHub Actions Workflow
  ├─ npm ci
  ├─ pnpm install
  ├─ pnpm lint (ESLint strict, 0 warnings)
  ├─ pnpm build (tsc strict mode + vite build)
  └─ Deploy to production
```

### Runtime Environment
```
User Browser (Chrome/Firefox/Safari)
  ↓
Vite Dev Server (localhost:3001, HMR)  OR  Production CDN
  ├─ React 18 app
  ├─ react-admin runtime
  └─ event listeners (environment-changed, etc.)
  ↓
REST API (api.readmigo.app) + PostHog (us.posthog.com)
```

