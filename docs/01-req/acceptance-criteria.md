---
title: Acceptance Criteria
phase: req
status: active
owner: data-team
last_updated: 2026-05-24
---

# Acceptance Criteria

## Functional acceptance

### Authentication & Authorization

- [x] Admin users can log in with email/password via POST `/api/v1/admin/auth/login`
- [x] JWT token persists in browser LocalStorage with 24-hour expiration
- [x] Logout clears token and redirects to login page
- [x] Dev mode (localhost:3000) auto-logs in without credentials
- [x] Session timeout: 30 minutes of inactivity triggers re-auth
- [x] Unauthorized API calls (401) redirect to login without error dialogs

### Dashboard Rendering

- [x] Main dashboard loads with KPI cards for DAU, MAU, signups, MRR, subscriptions
- [x] Each KPI card shows: current value, % change (vs. previous day), 7-day sparkline
- [x] Dashboard data refreshes every 5 minutes or on manual refresh click
- [x] No hardcoded API responses; all data queried from PostHog or Readmigo API in real time
- [x] Dashboard gracefully handles missing PostHog data (shows "No data" instead of crashing)

### CRUD Operations (12 Resource Types)

- [x] List pages load with sortable columns, pagination, and filters
- [x] Create page opens modal or new route with required field validation
- [x] Edit page shows pre-filled form with save and cancel buttons
- [x] Show page displays read-only detail view with related resources
- [x] Delete operations confirm before removing (prevent accidental deletion)
- [x] Bulk operations work: select multiple rows, apply action (delete, assign, change status)
- [x] All CRUD responses use react-admin's SimpleRestDataProvider (GET, POST, PUT, DELETE REST conventions)
- [x] Error states show user-friendly error message, not raw API responses

### Analytics Dashboards

- [x] Reading Stats page displays top-50 books by reading time with filters (language, category, date range)
- [x] Daily Report page shows YoY comparison (day-over-day and week-over-week % change)
- [x] Subscription Dashboard shows paywall→purchase conversion funnel with cohort breakdown
- [x] Highlight Analytics page displays highlight creation trends and top-highlighted books
- [x] Cost Management page lists 13 services with monthly cost and TCO projection
- [x] All charts render using Recharts with brand palette from `chartPalette` in brandTokens

### Multi-dimensional Filtering

- [x] Timezone selector in header applies to all date aggregations (6 options: Shanghai, Tokyo, New York, LA, London, UTC)
- [x] Environment selector switches between local and production endpoints (persists in LocalStorage)
- [x] Content Language Filter applies to analytics (English / Chinese / All)
- [x] UI Language Switcher renders all strings in 4 languages (EN, ZH-Hans, ZH-Hant, DE)
- [x] All selectors update without page reload; data re-fetches with new context

### Operational Features

- [x] Push Notifications page allows composing and sending messages to user segments
- [x] SE Import page triggers Standard Ebooks 4-node pipeline and polls for completion
- [x] Service Hub page shows links to PostHog, Sentry, Vercel, Supabase, and other services
- [x] Support Dashboard aggregates tickets and guest feedback in unified interface

### Error Handling & Resilience

- [x] Global Error Boundary catches unhandled errors and displays fallback UI
- [x] Errors automatically report to Sentry with stack trace and breadcrumbs
- [x] Network errors (timeout, 5xx) show user-friendly retry messages
- [x] Failed PostHog queries don't block page load (show placeholder chart)
- [x] Long-running operations (SE import, bulk delete) show progress bar or status message
- [x] API rate limit (429) errors show message and suggest retry timing

## Performance acceptance

### Page Load & Initial Render

- [x] Main dashboard initial load: <2 seconds (First Contentful Paint)
- [x] CRUD list pages load: <3 seconds with empty state or paginated data
- [x] Chart pages (Reading Stats, Subscription): <4 seconds including PostHog query
- [x] Vite build size: bundle <500 KB (gzip), assets <50 KB
- [x] No unused CSS or JavaScript in production build (Vite tree-shaking enabled)

### Runtime Performance

- [x] Interactive elements (buttons, form inputs) respond within 100ms
- [x] Chart re-render on data update: <500ms (no noticeable stutter)
- [x] Timezone/Language/Environment context switches cause re-render <300ms
- [x] Pagination page change: <1 second
- [x] Search/filter in list pages: <500ms debounced

### Data Fetching & Caching

- [x] PostHog queries complete within 5 seconds (timeout if longer)
- [x] API calls to Readmigo endpoint respond within 3 seconds
- [x] No redundant API calls: cache repeated requests for same resource within 60 seconds
- [x] Background data refresh (5-minute KPI refresh) doesn't block UI interactions
- [x] Long-running operations (SE import) use polling with exponential backoff: 1s, 2s, 4s, 8s (max 30s)

### Resource Usage

- [x] Memory usage stable at <200 MB (no memory leaks after 1 hour of usage)
- [x] Debug log ring buffer (200 entries) never exceeds 5 MB
- [x] LocalStorage usage <1 MB (timezone, language, environment preferences)
- [x] No DOM node bloat: React DevTools component count <500

### Browser Compatibility

- [x] Chrome 125+: full support
- [x] Firefox 121+: full support
- [x] Safari 17+: full support
- [x] Edge 125+: full support
- [x] Mobile browsers (Safari iOS, Chrome Android): not officially supported; mobile UI may degrade

## Security acceptance

### Authentication & Authorization

- [x] JWT tokens verified on backend before granting access to API endpoints
- [x] Token expiration enforced: 24-hour max, shorter if specified by backend
- [x] Logout clears token from LocalStorage and browser cookies
- [x] Dev mode (localhost:3000) auto-login uses hardcoded credentials, not real tokens
- [x] No tokens or credentials logged to console or Sentry
- [x] CORS configured: dashboard only makes requests to `api.readmigo.app` (no open allow-all)

### Data Protection

- [x] Sensitive user data (email, phone) shown only to authorized users (internal admins)
- [x] PII in error logs redacted before sending to Sentry (no email/user ID/IP in stack traces)
- [x] LocalStorage contains only non-sensitive settings (timezone, language); no user tokens in LocalStorage
- [x] Bulk export (CSV) requires explicit user action; no auto-download of sensitive data
- [x] Passwords never displayed or logged; login form uses type="password"

### API & Network Security

- [x] All API calls to `api.readmigo.app` use HTTPS (no HTTP fallback)
- [x] PostHog API key stored in `.env` (VITE_POSTHOG_API_KEY); not exposed in bundle
- [x] Environment variables exposed to frontend start with `VITE_` prefix only
- [x] No hardcoded API keys or secrets in source code (use .env files)
- [x] Requests to PostHog and Readmigo API include Authorization headers (JWT/API key)
- [x] CSRF tokens included in state-changing requests if required by backend

### Client-Side Security

- [x] HTML input fields sanitized to prevent XSS (react-admin and MUI handle escaping)
- [x] No dynamic code execution in frontend (safe JSON parsing, no Function constructor usage)
- [x] Content Security Policy header present (if served from Vercel/GitHub Pages)
- [x] Third-party libraries scanned for vulnerabilities in CI/CD (npm audit pass)
- [x] Source maps uploaded to Sentry; git secrets scanned in CI/CD

### Error Tracking & Observability

- [x] Sentry integration configured with correct DSN from environment variables
- [x] Errors sent to Sentry include: message, stack trace, breadcrumbs, release version, user email
- [x] Source maps uploaded on every deploy for readable stack traces
- [x] Sentry errors do not expose internal API endpoints or database queries
- [x] Sentry errors scrubbed of PII (email, user ID) before transmission
- [x] Alert rules configured for: error rate >5%, new error type, critical errors

### External Dependencies

- [x] PostHog API endpoint verified (not hijackable by network attack)
- [x] Readmigo API endpoint verified with TLS certificate validation
- [x] No inline script tags; all JavaScript in `.js` files or `<script>` tags with integrity hashes
- [x] Dependencies updated monthly; no abandoned or unmaintained packages
- [x] react-admin v5 and MUI v6 maintained; security patches applied within 30 days

