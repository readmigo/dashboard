---
title: Non-functional Requirements (ISO 25010)
phase: req
status: active
owner: data-team
last_updated: 2026-05-24
---

# Non-functional Requirements (ISO 25010)

## Functional Suitability

Measures the extent to which the product fulfills its intended purpose and user needs.

### Completeness

- All 6 analytics dashboards (Main, Reading Stats, Daily Report, Subscription, Highlight, Cost Management) fully implemented with no stub screens
- All 12 CRUD resource types (books, authors, booklists, categories, users, quotes, messages, guest feedback, import batches, tickets, feedback, orders) include list, create, edit, and show views
- All 3 operational modules (Push Notifications, SE Import, Service Hub) fully functional
- Multi-dimensional filtering (timezone, environment, language) applies consistently across all dashboards
- PostHog queries validated against HogQL schema; no malformed queries in production

### Correctness

- KPI calculations match PostHog aggregation logic exactly (no off-by-one errors in daily metrics)
- Timezone conversions use browser Intl API or Day.js; no manual offset math
- Pagination offsets correct for 0-indexed and 1-indexed APIs
- Date ranges include start and end days (inclusive)
- Currency formatting consistent across all currency fields (USD with 2 decimals)

### Appropriateness

- Dashboard metrics directly address operations team needs (no metrics-for-metrics-sake)
- CRUD forms include only fields relevant to each resource type (no form bloat)
- Chart types selected to match data dimensionality (e.g., bar for rankings, line for trends, sankey for funnels)
- Alert thresholds (e.g., for errors >5%) align with business SLAs

## Performance Efficiency

Measures the resources required to deliver functionality under specified conditions.

### Time Behavior

- Main dashboard First Contentful Paint (FCP): <2 seconds on 4G network (Lighthouse Fast 4G)
- CRUD list page load: <3 seconds
- Chart page load (with PostHog query): <4 seconds
- Interactive elements respond within 100ms (button clicks, form inputs)
- Chart re-renders <500ms when data updates
- Context switches (timezone, language, environment) re-render <300ms
- Pagination: <1 second per page transition
- Search/filter input debounced to <500ms latency

### Resource Use

- Bundle size (gzip): <500 KB for main app
- Assets: <50 KB for static images, icons
- Initial HTTP requests: <30 (combine with bundling)
- CSS-in-JS (emotion) compiles to <100 KB gzip
- Memory consumption: <200 MB steady state after 1 hour usage (no memory leak)
- Debug log ring buffer: 200 entries, <5 MB max
- LocalStorage: <1 MB for user preferences
- No unused CSS or JavaScript in production build (Vite tree-shaking)

### Capacity

- Pagination support: 10, 25, 50, 100 items per page (default 25)
- PostHog query time window: up to 90 days (degrades beyond 180 days)
- Bulk operations: batch size ≤ 100 records
- SE Import pipeline: 4 nodes, max 1,000 books per batch
- Push notification segments: up to 1,000,000 users targeted
- Concurrent users: no hard limit (serverless SPA)
- CSV export: no row limit (but file size capped at 10 MB)

## Compatibility

Measures the extent to which the product can exchange information with other systems.

### Co-existence

- Dashboard runs alongside all Readmigo services without interference
- Does not modify shared resources (PostHog events, Readmigo API database)
- Respects API rate limits (120 req/min PostHog, backend-specific for Readmigo API)
- Reads-only from PostHog (no event ingestion from dashboard)
- Read-write to Readmigo API (CRUD operations only)

### Interoperability

- REST API calls follow react-admin SimpleRestDataProvider conventions (GET, POST, PUT, DELETE)
- PostHog integration uses HogQL API (JSON request/response)
- Sentry integration uses standard JavaScript SDK
- Import data from SE via JSON; no proprietary formats
- Export data to CSV (RFC 4180 standard)
- Timezone support via IANA timezone names (e.g., "Asia/Shanghai")
- Language codes: ISO 639-1 (en, zh, de)

## Usability

Measures the extent to which the product can be used by specified users to achieve specified goals with effectiveness, efficiency, and satisfaction.

### Learnability

- First-time admin user learns main workflow (view dashboard, filter, drill-down) within 10 minutes
- Tooltips present on all non-obvious icons and controls
- Help button links to API documentation and operations SOP
- Form validation messages are clear and actionable (not "Invalid input")
- Consistent UI patterns: same button placement, form layout, modal behavior across all pages

### Operability

- All multi-select dropdowns support keyboard navigation (arrow keys, enter)
- All modal actions support keyboard (ESC to close, ENTER to submit)
- Timestamp ranges support natural date input (e.g., "last 7 days" preset, calendar picker)
- Environment and timezone selectors persist to LocalStorage (no re-selection per session)
- Keyboard shortcuts for common actions (e.g., CTRL+S to save form, ESC to cancel)

### Accessibility

- WCAG 2.1 Level AA compliance (text contrast ≥ 4.5:1, font size ≥ 12px)
- All images and icons have alt text or aria-labels
- Form labels associated with inputs (<label> tags with htmlFor)
- Error messages linked to form fields with aria-describedby
- No reliance on color alone to convey information (e.g., status icons have text labels)
- Focus visible for keyboard navigation (outline visible on <button> and <input>)
- Screen reader compatible: semantic HTML, ARIA roles for custom components

### User error prevention

- Confirmation dialog required before delete or bulk operations
- "Are you sure?" prompt includes affected resource count
- Unsaved form changes trigger "Leave page?" warning
- Required fields marked with red asterisk and validation enforced before submit
- Duplicate entries in forms prevented (e.g., duplicate category name)
- Typo detection: search/filter shows "No results" with "Did you mean?" suggestion (optional)

### User interface aesthetics

- Material Design 3 component library (MUI v6) with brand color tokens
- All colors sourced from `src/theme/brandTokens.ts` (no hardcoded hex values)
- Chart colors use `chartPalette` from brandTokens
- Consistent spacing grid (8px base unit)
- Font sizes: 12px (small), 14px (body), 16px (heading3), 20px (heading2), 28px (heading1)
- Consistent icon library (Material Icons)

## Reliability

Measures the extent to which the product performs its intended functions correctly under stated conditions.

### Maturity

- Dashboard in production use by operations team for 6+ months
- No known critical bugs reported
- Error rate <1% (Sentry monitoring)
- Uptime target: 99.5% (service-level agreement)

### Fault Tolerance

- Global Error Boundary catches unhandled JavaScript errors
- Failed PostHog queries show "No data" instead of crashing page
- Failed API calls show retry button with exponential backoff
- Long-running operations (SE import) use polling; timeout after 30 minutes with error
- Offline detection: shows "No internet connection" instead of silent failures

### Recoverability

- Session recovery: if auth token expires, user prompted to log in (no data loss)
- Form recovery: unsaved form data persists in session storage; recover on re-enter
- Bulk operation interruption: partially processed records don't corrupt state (transactional)
- API errors return structured response (error code, message, retry suggestion)

### Availability

- Dashboard deployed to Vercel/GitHub Pages with 99.9% uptime SLA
- CDN caching for static assets (bundle, images)
- Auto-deploy on main branch push (zero downtime deployment)
- Rollback available within 5 minutes if deployment issues detected
- No single point of failure: PostHog and Readmigo API are external services (fallback documentation if unavailable)

## Security

Measures the extent to which the product protects data and functionality from unauthorized access.

### Confidentiality

- JWT token expiration: 24 hours max (or backend-specified)
- Sensitive fields (email, phone) visible only to authenticated admins
- PII redacted from Sentry error logs (no email/user ID/IP in stack traces)
- LocalStorage never contains auth tokens or credentials
- API requests include Authorization header (JWT or API key)
- HTTPS enforced for all API communication (no HTTP fallback)

### Integrity

- API requests validated with JWT signature (backend responsibility)
- CSRF protection: state-changing requests (POST, PUT, DELETE) require CSRF token if backend enforces
- No server-side code execution in frontend (safe JSON parsing only)
- Source maps uploaded to Sentry only (not publicly accessible)
- Dependencies scanned for known vulnerabilities (npm audit)

### Non-repudiation

- All user actions logged to Readmigo API (edit, delete, send notification)
- Sentry tracks error events with user email and timestamp
- Audit trail available for all CRUD operations (backend responsibility)
- Admin action history persists for compliance audits (30-day retention minimum)

### Accountability

- Error events include: user email, IP address, timestamp, action, error context
- Bulk operations log: operator email, affected records, timestamp
- Push notification campaigns logged: sender, target segment count, delivery timestamp
- Export actions logged: who exported what data and when

### Authenticity

- Admin login requires email + password (no anonymous access)
- Dev mode auto-login only available on localhost (not in production)
- Session token issued on successful auth (verify on each API call)
- Multi-device support: separate tokens per device (no auto-logout on other device login)

## Maintainability

Measures the extent to which the product can be modified by developers efficiently and with low risk.

### Modularity

- Components organized by feature: `src/pages/`, `src/components/`, `src/services/`
- Service layer decoupled from UI (PostHog API client, Readmigo API client, auth provider)
- React Context used for cross-cutting concerns (timezone, language, environment, auth)
- Custom hooks extract common logic (usePostHogQuery, useTimezone, etc.)
- No monolithic page components (each page <500 lines)

### Reusability

- Shared components: buttons, cards, tables, modals (react-admin + MUI components)
- Recharts wrapper components for common chart types
- PostHog query templates parameterized for date range, filters
- i18n strings extracted to centralized files; no hardcoded strings in components
- Brand tokens centralized in `src/theme/brandTokens.ts` (colors, shadows, spacing)

### Analyzability

- Code comments explain "why", not "what" (assume reader understands code)
- Type annotations throughout (TypeScript strict mode enabled)
- Errors include context: file path, line number, function name in stack traces
- Sentry breadcrumbs track user actions leading to error (useful for reproduction)
- Debug logs (window.__DEBUG_LOG__) capture API calls, state changes, user actions

### Modifiability

- Feature toggles for experimental features (via config or environment variable)
- PostHog query updates don't require rebuilding (queries in `src/config/posthog-queries.ts`)
- Theme colors updatable without touching components (edit `brandTokens.ts`)
- i18n strings updatable without rebuilding (if using external i18n service; currently inline)
- API endpoints configurable via environment variables (VITE_API_URL, VITE_POSTHOG_HOST)

### Testability

- Unit tests for services (PostHog client, auth logic) with >80% coverage
- E2E tests for critical flows (login, view dashboard, CRUD operation) using Playwright
- Mock data available for services when backend is unavailable
- Test fixtures for complex data (large PostHog response, multi-level nested objects)
- Error scenarios tested: network timeout, rate limit, malformed response, auth failure

## Portability

Measures the extent to which the product can be adapted to different environments or platforms.

### Adaptability

- Dashboard works on Chrome, Firefox, Safari, Edge (latest 2 versions)
- No browser-specific APIs; uses Web Standards (Fetch, localStorage, Intl)
- Responsive design supports 1024px+ screen width (no mobile optimization required)
- Timezone support: works with any IANA timezone database (no hardcoded offsets)
- Language support: 4 languages (EN, ZH-Hans, ZH-Hant, DE); easy to add more

### Installability

- Single command install: `pnpm install`
- No native dependencies (all JavaScript)
- Works on macOS, Linux, Windows 10+ (Node.js 20.x required)
- Environment variables via `.env.local` file (no config file format differences)
- Deployment: `pnpm build` outputs static assets; no backend server required

### Replaceability

- Dashboard can be replaced with alternative UI without backend changes (REST API unchanged)
- Data exports (CSV) portable to other tools (standard RFC 4180 format)
- PostHog queries exportable to Jupyter notebooks or BI tools
- Database schema changes don't break dashboard (only schema additions supported, no removals)
- Authentication can be swapped (OAuth, SAML) with minimal changes to authProvider

### Conformance

- Follows react-admin architectural patterns (Admin, Resource, dataProvider)
- MUI design system compliance: colors, typography, spacing from design tokens
- React 18 best practices: hooks, function components, no legacy class components
- TypeScript strict mode enabled (no `any` types without justification)
- ESLint configuration enforces code style (runs in CI/CD; failures block merge)

