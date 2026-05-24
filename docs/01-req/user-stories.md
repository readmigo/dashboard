---
title: User Stories
phase: req
status: active
owner: data-team
last_updated: 2026-05-24
---

# User Stories

## User roles

| Role | Department | Key Responsibilities | Typical Tools | Admin Access |
|------|-----------|---------------------|----------------|----|
| **Operations Manager** | Operations | Daily monitoring of DAU, MAU, retention, revenue metrics; trend spotting; escalation | Main Dashboard, Daily Report, Subscription Dashboard | Full (read + write) |
| **Product Manager** | Product | Feature impact analysis, user retention funnels, A/B test result analysis, roadmap prioritization | Reading Stats, Highlight Analytics, Daily Report | Read-only (view) |
| **Content Manager** | Content | Book rankings, category performance, author management, Standard Ebooks imports | Reading Stats, SE Import, Books CRUD | Full (read + write for books, authors, categories; read-only for analytics) |
| **Support Lead** | Support | Ticket management, guest feedback triage, user escalations, issue frequency tracking | Support Dashboard, Tickets, Guest Feedback | Full (read + write for tickets/feedback; read-only for analytics) |
| **Finance/CFO** | Finance | Service cost tracking, budget compliance, ARPU and MRR trends, TCO projections | Cost Management, Subscription Dashboard | Read-only (view financial metrics only) |
| **Developer** | Engineering | Debug operations issues, monitor error rates, verify feature deployments, check API health | Debug logs, Sentry integration, Service Hub | Full (debug access; limited data write) |
| **Marketing/Growth** | Growth | Push notification campaigns, user segment targeting, acquisition channel analysis | Push Notifications, Daily Report | Full (push notifications); Read-only (analytics) |

## Primary stories

### 1. Operations Manager — Daily KPI Review
**Story:** As an operations manager, I want to view real-time KPIs (DAU, MAU, signups, MRR, subscriptions) on the main dashboard so that I can quickly identify trends and escalate anomalies to the team.

**Acceptance Criteria:**
- Main dashboard loads in <2s with live data from PostHog
- KPI cards show current value, % change vs. previous day, and sparkline trend (7-day)
- Data refreshes every 5 minutes or on manual click
- Timezone selector applies to all date aggregations
- Environment selector switches between local and production without reloading

**Related Documentation:** `src/pages/Dashboard.tsx`, PostHog queries config

---

### 2. Content Manager — Book Ranking Analysis
**Story:** As a content manager, I want to see top-50 most-read books ranked by reading time, filtered by language and category, so that I can make data-driven decisions about featured content and curation.

**Acceptance Criteria:**
- Reading Stats page displays books in sortable, paginated table
- Columns: rank, book title, author, reading time (hours), reader count, category
- Filter by: language (en/zh/all), category, date range (last 7/30/90 days)
- Sort by: reading time (desc), reader count, title
- Export table to CSV for sharing

**Related Documentation:** `src/pages/reading-stats/`, PostHog HogQL reading behavior queries

---

### 3. Product Manager — Subscription Conversion Funnel
**Story:** As a product manager, I want to view the subscription conversion funnel (paywall views → purchase attempts → successful purchases) with cohort and segment breakdowns so that I can identify drop-off points and prioritize paywall optimization.

**Acceptance Criteria:**
- Subscription Dashboard shows funnel visualization with 4 stages
- Each stage displays: count, conversion rate, cohort breakdown (iOS/Android/Web)
- Drill-down to see user lists at each funnel step
- Compare current period vs. previous period
- Trend chart showing conversion rate over 30 days

**Related Documentation:** `src/pages/subscriptions/SubscriptionDashboard.tsx`

---

### 4. Content Manager — Standard Ebooks Import
**Story:** As a content manager, I want to trigger and monitor Standard Ebooks imports so that I can incrementally add new books without manual data entry.

**Acceptance Criteria:**
- SE Import page shows current import batch status (running, completed, failed)
- Display: batch ID, source count, parsed count, populated count, errors
- "Trigger Import" button initiates 4-node pipeline (calc → parse → populate → discover)
- UI polls every 10s for status updates; supports exponential backoff if API is slow
- On completion, show summary and list of newly added books
- On failure, display error log and retry option

**Related Documentation:** `src/pages/se-import/SEIncrementalImport.tsx`

---

### 5. Support Lead — Ticket Management
**Story:** As a support lead, I want to view and manage support tickets and guest feedback in a unified interface so that I can triage issues, assign to team members, and track resolution.

**Acceptance Criteria:**
- Tickets and Guest Feedback CRUD pages show list with filters
- Columns: ticket ID, user email, subject, priority, status, created date
- Filters: status (open/resolved/closed), priority (low/medium/high), assigned to, date range
- Click row to view full conversation thread
- Edit: change status, priority, assigned user; add internal notes
- Bulk actions: mark as resolved, bulk assign

**Related Documentation:** `src/pages/tickets/`, `src/pages/guest-feedback/`

---

### 6. Growth Manager — Push Notification Campaign
**Story:** As a growth manager, I want to create and send push notifications to user segments so that I can drive engagement with time-sensitive offers and announcements.

**Acceptance Criteria:**
- Push Notifications page shows form: target segment, message title, body, CTA
- Segment options: all users, language (en/zh), subscription status (active/lapsed), retention cohort (D1/D7/D30)
- Preview: show message as it appears on iOS/Android
- Send button triggers notification delivery; track delivery status in real time
- History tab shows past campaigns with delivery count, click count, click rate
- Allow scheduling for future delivery (within 7 days)

**Related Documentation:** `src/pages/push-notifications/PushNotificationsPage.tsx`

---

### 7. Developer — Debugging Production Issues
**Story:** As a developer, I want access to debug logs and error tracking so that I can quickly diagnose production issues and verify fixes.

**Acceptance Criteria:**
- Global `window.__DEBUG_LOG__` accessible via browser console
- Log entry format: timestamp, level (INFO/WARN/ERROR), subsystem, message
- Ring buffer auto-rotates after 200 entries; no memory leak
- Error Boundary catches unhandled errors and logs to Sentry
- Debug logs capture: API call details, context state changes, user actions
- Export logs to JSON for sharing with teammates

**Related Documentation:** `src/components/GlobalErrorBoundary.tsx`, `src/components/DebugErrorBoundary.tsx`

---

## Edge stories

### 8. Timezone-aware Reporting Across Regions
**Story:** As an operations manager in Shanghai, I want the dashboard to show all dates and times in my local timezone (UTC+8) so that I can compare metrics with my team without mental math.

**Acceptance Criteria:**
- Timezone selector in header; 6 options (Shanghai, Tokyo, New York, LA, London, UTC)
- All timestamps convert to selected timezone (not just display conversion)
- PostHog queries adjust aggregation window based on timezone
- Preference persists in LocalStorage
- Time heatmap (reading activity by hour) shifts by timezone offset

**Related Documentation:** `src/contexts/TimezoneContext.tsx`, `src/components/TimezoneSelector.tsx`

---

### 9. Multi-language UI Support for International Team
**Story:** As a German-speaking content manager, I want the dashboard UI in German so that I can work efficiently without English language friction.

**Acceptance Criteria:**
- UI languages: English, Simplified Chinese, Traditional Chinese, German
- Language selector in header; preference persists
- All i18n strings extracted to `src/i18n/{locale}.ts`
- Chart labels, error messages, button labels all localized
- Date formatting respects locale (DD/MM/YYYY vs. MM/DD/YYYY)

**Related Documentation:** `src/i18n/`, `src/components/LanguageSwitcher.tsx`

---

### 10. Cost Management & Budget Tracking
**Story:** As a CFO, I want to view and track the cost of 13 Readmigo services against our $400/month budget and see 4-year TCO projections so that I can optimize infrastructure spending.

**Acceptance Criteria:**
- Cost Management page lists all services with: monthly cost, % of budget, YoY trend
- Services: PostHog, Sentry, Vercel, Supabase, AWS, SendGrid, Twilio, etc. (13 total)
- Budget gauge: show current spend vs. $400/mo cap; highlight if over
- Projection chart: show 4-year TCO with inflation at 5% CAGR
- Export cost summary to CSV for finance reporting

**Related Documentation:** `src/pages/CostManagement.tsx`

---

### 11. Multi-environment Dev/Prod Switching
**Story:** As a developer, I want to switch between local and production API endpoints with a single click so that I can debug issues against real data without code changes.

**Acceptance Criteria:**
- Environment selector in header: "Local" (localhost:3000) vs. "Production" (api.readmigo.app)
- Selection persists in LocalStorage
- On change, dashboard re-fetches all data from new endpoint
- Error message if production endpoint is unreachable
- Dev mode: auto-login (skip JWT auth) if running on localhost

**Related Documentation:** `src/contexts/EnvironmentContext.tsx`, `src/components/EnvironmentSelector.tsx`

---

### 12. Sentry Integration for Error Tracking
**Story:** As an engineer, I want errors in the dashboard to automatically report to Sentry so that I can monitor frontend health and be alerted to regressions.

**Acceptance Criteria:**
- Unhandled errors caught by Error Boundary and sent to Sentry
- Sentry events include: error message, stack trace, release version, user email, breadcrumbs
- Source maps uploaded on deploy for readable stack traces
- Sentry dashboard accessible from Service Hub
- Error rates monitored in CI/CD pipeline; alert if >5% error rate

**Related Documentation:** `src/components/GlobalErrorBoundary.tsx`

---

### 13. Highlight Analytics — User Annotation Tracking
**Story:** As a product manager, I want to see user highlight (annotation) creation frequency and correlate it with reading progress so that I can understand engagement with the reading experience.

**Acceptance Criteria:**
- Highlight Analytics page shows HogQL query results: highlights per day, top-highlighted books, highlight rate by user cohort
- Cohorts: iOS/Android/Web, language (en/zh), subscription status
- Trend: highlight count over 30 days
- Drill-down: see top-10 highlighted passages
- Correlation with reading time: show highlight rate vs. average reading time per session

**Related Documentation:** `src/pages/highlight-analytics/HighlightAnalyticsPage.tsx`

---

### 14. Content Language Filter for Analytics
**Story:** As a product manager, I want to filter all analytics metrics by content language (English only, Chinese only, or All) so that I can understand language-specific user behavior.

**Acceptance Criteria:**
- Content Language Filter in header: "English", "Chinese", "All"
- Applies to all analytics dashboards: Main, Reading Stats, Daily Report, Subscription, Highlights
- PostHog queries filtered by user's preferred language field
- Language filter persists in LocalStorage
- Toggle works without page reload; data re-fetches with new filter

**Related Documentation:** `src/contexts/ContentLanguageContext.tsx`, `src/components/ContentLanguageSwitch.tsx`

