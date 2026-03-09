/**
 * PostHog HogQL Query Templates
 * Reusable queries for operational data analysis
 *
 * Usage: Import query functions → call with parameters → pass to PostHog query API
 * API endpoint: POST /api/projects/{projectId}/query/
 * Headers: Authorization: Bearer {personalApiKey}, Content-Type: application/json
 * Body: { "query": { "kind": "HogQLQuery", "query": "..." } }
 */

// ============================================================
// 1. User Growth Queries
// ============================================================

/** Daily Active Users (DAU) */
export const dauQuery = (days = 30) => `
SELECT toDate(timestamp) as day,
       count(DISTINCT distinct_id) as dau
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND event NOT IN ('$set')
GROUP BY day
ORDER BY day`;

/** Weekly Active Users (WAU) */
export const wauQuery = (days = 30) => `
SELECT toStartOfWeek(timestamp) as week,
       count(DISTINCT distinct_id) as wau
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND event NOT IN ('$set')
GROUP BY week
ORDER BY week`;

/** Monthly Active Users (MAU) */
export const mauQuery = (months = 3) => `
SELECT toStartOfMonth(timestamp) as month,
       count(DISTINCT distinct_id) as mau
FROM events
WHERE timestamp >= now() - INTERVAL ${months} MONTH
  AND event NOT IN ('$set')
GROUP BY month
ORDER BY month`;

/** Daily new signups */
export const signupTrendQuery = (days = 30) => `
SELECT toDate(timestamp) as day,
       count() as signups
FROM events
WHERE event IN ('user_signed_up', 'user_signup')
  AND timestamp >= now() - INTERVAL ${days} DAY
GROUP BY day
ORDER BY day`;

// ============================================================
// 2. Event Volume Queries
// ============================================================

/** Top events by volume */
export const eventVolumeQuery = (days = 30, limit = 30) => `
SELECT event,
       count() as cnt,
       count(DISTINCT distinct_id) as users
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
GROUP BY event
ORDER BY cnt DESC
LIMIT ${limit}`;

// ============================================================
// 3. Onboarding Funnel Queries
// ============================================================

/** Full onboarding funnel: Install → Onboard → Signup → Read */
export const onboardingFunnelQuery = (days = 30) => `
SELECT '1_install' as step, count(DISTINCT distinct_id) as users
FROM events WHERE event = 'Application Installed' AND timestamp >= now() - INTERVAL ${days} DAY
UNION ALL
SELECT '2_onboard_start' as step, count(DISTINCT distinct_id) as users
FROM events WHERE event = 'onboarding_started' AND timestamp >= now() - INTERVAL ${days} DAY
UNION ALL
SELECT '3_onboard_done' as step, count(DISTINCT distinct_id) as users
FROM events WHERE event = 'onboarding_completed' AND timestamp >= now() - INTERVAL ${days} DAY
UNION ALL
SELECT '4_signup' as step, count(DISTINCT distinct_id) as users
FROM events WHERE event IN ('user_signup', 'user_signed_up') AND timestamp >= now() - INTERVAL ${days} DAY
UNION ALL
SELECT '5_reading' as step, count(DISTINCT distinct_id) as users
FROM events WHERE event = 'reading_started' AND timestamp >= now() - INTERVAL ${days} DAY
ORDER BY step`;

// ============================================================
// 4. Reading Analytics Queries
// ============================================================

/** Reading session summary */
export const readingSessionSummaryQuery = (days = 30) => `
SELECT count() as total_sessions,
       count(DISTINCT distinct_id) as readers
FROM events
WHERE event = 'reading_session_ended'
  AND timestamp >= now() - INTERVAL ${days} DAY`;

/** Daily reading sessions trend */
export const readingTrendQuery = (days = 30) => `
SELECT toDate(timestamp) as day,
       count() as sessions,
       count(DISTINCT distinct_id) as readers
FROM events
WHERE event = 'reading_session_ended'
  AND timestamp >= now() - INTERVAL ${days} DAY
GROUP BY day
ORDER BY day`;

// ============================================================
// 5. Feature Usage Queries
// ============================================================

/** Feature adoption metrics */
export const featureUsageQuery = (days = 30) => `
SELECT event,
       count() as cnt,
       count(DISTINCT distinct_id) as users
FROM events
WHERE event IN (
  'audiobook_play_started', 'audiobook_session_ended',
  'tts_started', 'tts_stopped',
  'bookmark_created', 'highlight_created',
  'reader_setting_changed', 'chapter_navigated',
  'app_review_requested'
)
  AND timestamp >= now() - INTERVAL ${days} DAY
GROUP BY event
ORDER BY cnt DESC`;

// ============================================================
// 6. Monetization Queries
// ============================================================

/** Paywall and purchase funnel */
export const monetizationFunnelQuery = (days = 30) => `
SELECT event,
       count() as cnt,
       count(DISTINCT distinct_id) as users
FROM events
WHERE event IN (
  'paywall_viewed', 'paywall_dismissed',
  'purchase_initiated', 'subscription_purchased',
  'billing_query_products_success'
)
  AND timestamp >= now() - INTERVAL ${days} DAY
GROUP BY event
ORDER BY cnt DESC`;

// ============================================================
// 7. Platform Distribution Queries
// ============================================================

/** User platform and app version distribution */
export const platformDistributionQuery = (days = 30, limit = 20) => `
SELECT properties.$os as os,
       properties.$app_version as app_ver,
       count(DISTINCT distinct_id) as users
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND event = 'Application Opened'
GROUP BY os, app_ver
ORDER BY users DESC
LIMIT ${limit}`;

/** OS share summary */
export const osShareQuery = (days = 30) => `
SELECT properties.$os as os,
       count(DISTINCT distinct_id) as users
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND event = 'Application Opened'
GROUP BY os
ORDER BY users DESC`;

// ============================================================
// Helper: Build PostHog query request body
// ============================================================

export const buildHogQLRequest = (query: string) => ({
  query: {
    kind: 'HogQLQuery' as const,
    query: query.trim(),
  },
});
