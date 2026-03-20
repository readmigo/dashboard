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
// 8. Internal User Filter (data cleaning)
// ============================================================

import { INTERNAL_USER_IDS } from './analytics-config';

const internalIdList = INTERNAL_USER_IDS.map((id) => `'${id}'`).join(', ');

/** Standard WHERE clause to exclude internal test users */
export const excludeInternalWhere = () =>
  `distinct_id NOT IN (${internalIdList})`;

/** DAU excluding internal users */
export const cleanDauQuery = (days = 30) => `
SELECT toDate(timestamp) as day,
       count(DISTINCT distinct_id) as dau
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND event NOT IN ('$set')
  AND ${excludeInternalWhere()}
GROUP BY day
ORDER BY day`;

/** Internal users activity analysis */
export const internalUsersAnalysisQuery = (days = 30) => `
SELECT distinct_id,
       properties.$os as os,
       properties.device_model as device,
       count() as events,
       count(DISTINCT properties.$app_version) as versions_used,
       min(timestamp) as first_seen,
       max(timestamp) as last_seen
FROM events
WHERE distinct_id IN (${internalIdList})
  AND timestamp >= now() - INTERVAL ${days} DAY
GROUP BY distinct_id, os, device
ORDER BY events DESC`;

/** Detect potential new internal users (4+ app versions) */
export const detectInternalUsersQuery = (days = 60) => `
SELECT distinct_id,
       count(DISTINCT properties.$app_version) as version_count,
       count() as total_events,
       groupArray(DISTINCT properties.$app_version) as versions
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
GROUP BY distinct_id
HAVING version_count >= 4
ORDER BY version_count DESC`;

// ============================================================
// 9. Book Rankings & Content Analysis
// ============================================================

/** Top books by reading sessions (clean) */
export const topBooksQuery = (days = 30, limit = 20) => `
SELECT properties.book_id as book_id,
       properties.book_title as title,
       count() as sessions,
       count(DISTINCT distinct_id) as readers
FROM events
WHERE event IN ('reading_started', 'reading_session_ended')
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND properties.book_id IS NOT NULL
  AND ${excludeInternalWhere()}
GROUP BY book_id, title
ORDER BY sessions DESC
LIMIT ${limit}`;

/** Top audiobooks by play count (clean) */
export const topAudiobooksQuery = (days = 30, limit = 15) => `
SELECT properties.audiobook_title as title,
       properties.audiobook_id as audiobook_id,
       count() as plays,
       count(DISTINCT distinct_id) as listeners
FROM events
WHERE event IN ('audiobook_play_started', 'audiobook_started')
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND ${excludeInternalWhere()}
GROUP BY title, audiobook_id
ORDER BY plays DESC
LIMIT ${limit}`;

/** Books with TTS usage */
export const booksTtsUsageQuery = (days = 30, limit = 15) => `
SELECT properties.book_id as book_id,
       properties.book_title as title,
       count() as tts_starts,
       count(DISTINCT distinct_id) as users
FROM events
WHERE event = 'tts_started'
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND properties.book_id IS NOT NULL
  AND ${excludeInternalWhere()}
GROUP BY book_id, title
ORDER BY tts_starts DESC
LIMIT ${limit}`;

// ============================================================
// 10. User Language & Locale Analysis
// ============================================================

/** User locale distribution (clean) */
export const userLocaleQuery = (days = 30) => `
SELECT properties.$locale as locale,
       count(DISTINCT distinct_id) as users,
       count() as events
FROM events
WHERE event = 'Application Opened'
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND ${excludeInternalWhere()}
GROUP BY locale
ORDER BY users DESC`;

/** Reading language preferences (by book title charset) */
export const readingLanguageQuery = (days = 30) => `
SELECT properties.book_title as title,
       properties.book_id as book_id,
       count() as sessions,
       count(DISTINCT distinct_id) as readers
FROM events
WHERE event IN ('reading_started', 'reading_session_ended')
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND properties.book_title IS NOT NULL
  AND ${excludeInternalWhere()}
GROUP BY title, book_id
ORDER BY sessions DESC
LIMIT 50`;

// ============================================================
// 11. User Profile & Engagement Depth
// ============================================================

/** English level distribution */
export const englishLevelQuery = (days = 30) => `
SELECT person.properties.english_level as level,
       count(DISTINCT distinct_id) as users
FROM events
WHERE event = 'Application Opened'
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND person.properties.english_level IS NOT NULL
  AND ${excludeInternalWhere()}
GROUP BY level
ORDER BY users DESC`;

/** Subscription tier distribution */
export const subscriptionTierQuery = (days = 30) => `
SELECT person.properties.subscription_plan as plan,
       count(DISTINCT distinct_id) as users
FROM events
WHERE event = 'Application Opened'
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND person.properties.subscription_plan IS NOT NULL
  AND ${excludeInternalWhere()}
GROUP BY plan
ORDER BY users DESC`;

/** User country distribution */
export const userCountryQuery = (days = 30) => `
SELECT person.properties.country as country,
       count(DISTINCT distinct_id) as users
FROM events
WHERE event = 'Application Opened'
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND person.properties.country IS NOT NULL
  AND ${excludeInternalWhere()}
GROUP BY country
ORDER BY users DESC`;

// ============================================================
// 12. Cross-Validation Queries
// ============================================================

/** Compare internal vs external event counts */
export const internalVsExternalQuery = (days = 30) => `
SELECT
  CASE WHEN distinct_id IN (${internalIdList}) THEN 'internal' ELSE 'external' END as user_type,
  count() as events,
  count(DISTINCT distinct_id) as users
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
GROUP BY user_type`;

/** is_internal flag verification */
export const isInternalFlagQuery = (days = 30) => `
SELECT properties.is_internal as is_internal,
       count() as events,
       count(DISTINCT distinct_id) as users
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND properties.is_internal IS NOT NULL
GROUP BY is_internal`;

// ============================================================
// 13. Highlight & Annotation Analytics
// ============================================================

/** Highlight user penetration: daily highlight users vs DAU */
export const highlightPenetrationQuery = (days = 30) => `
SELECT toDate(timestamp) as day,
       count(DISTINCT CASE WHEN event = 'highlight_created' THEN distinct_id END) as highlight_users,
       count(DISTINCT distinct_id) as all_active_users,
       round(highlight_users / all_active_users * 100, 1) as penetration_pct
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND event NOT IN ('$set')
  AND ${excludeInternalWhere()}
GROUP BY day
ORDER BY day`;

/** Highlights per user per day */
export const highlightsPerUserQuery = (days = 30) => `
SELECT toDate(timestamp) as day,
       count() as total_highlights,
       count(DISTINCT distinct_id) as users,
       round(total_highlights / users, 1) as per_user
FROM events
WHERE event = 'highlight_created'
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND ${excludeInternalWhere()}
GROUP BY day
ORDER BY day`;

/** Highlight color distribution */
export const highlightColorQuery = (days = 30) => `
SELECT properties.color as color,
       count() as cnt,
       round(cnt / sum(cnt) OVER () * 100, 1) as pct
FROM events
WHERE event = 'highlight_created'
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND properties.color IS NOT NULL
  AND ${excludeInternalWhere()}
GROUP BY color
ORDER BY cnt DESC`;

/** Highlight style distribution */
export const highlightStyleQuery = (days = 30) => `
SELECT properties.style as style,
       count() as cnt,
       round(cnt / sum(cnt) OVER () * 100, 1) as pct
FROM events
WHERE event = 'highlight_created'
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND properties.style IS NOT NULL
  AND ${excludeInternalWhere()}
GROUP BY style
ORDER BY cnt DESC`;

/** Text length distribution (bucketed) */
export const highlightTextLengthQuery = (days = 30) => `
SELECT
  CASE
    WHEN toInt64OrNull(toString(properties.text_length)) < 20 THEN '< 20 chars'
    WHEN toInt64OrNull(toString(properties.text_length)) < 50 THEN '20-50 chars'
    WHEN toInt64OrNull(toString(properties.text_length)) < 100 THEN '50-100 chars'
    ELSE '100+ chars'
  END as length_bucket,
  count() as cnt,
  round(cnt / sum(cnt) OVER () * 100, 1) as pct
FROM events
WHERE event = 'highlight_created'
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND properties.text_length IS NOT NULL
  AND ${excludeInternalWhere()}
GROUP BY length_bucket
ORDER BY cnt DESC`;

/** Top highlighted books */
export const topHighlightedBooksQuery = (days = 30, limit = 10) => `
SELECT properties.book_title as book,
       count() as highlights,
       count(DISTINCT distinct_id) as users
FROM events
WHERE event = 'highlight_created'
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND properties.book_title IS NOT NULL
  AND ${excludeInternalWhere()}
GROUP BY book
ORDER BY highlights DESC
LIMIT ${limit}`;

/** Highlight create vs delete trend */
export const highlightCreateDeleteQuery = (days = 30) => `
SELECT toDate(timestamp) as day,
       countIf(event = 'highlight_created') as created,
       countIf(event = 'highlight_deleted') as deleted
FROM events
WHERE event IN ('highlight_created', 'highlight_deleted')
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND ${excludeInternalWhere()}
GROUP BY day
ORDER BY day`;

/** Highlight platform distribution */
export const highlightPlatformQuery = (days = 30) => `
SELECT properties.platform as platform,
       count() as cnt,
       count(DISTINCT distinct_id) as users
FROM events
WHERE event = 'highlight_created'
  AND timestamp >= now() - INTERVAL ${days} DAY
  AND ${excludeInternalWhere()}
GROUP BY platform
ORDER BY cnt DESC`;

// ============================================================
// Helper: Build PostHog query request body
// ============================================================

export const buildHogQLRequest = (query: string) => ({
  query: {
    kind: 'HogQLQuery' as const,
    query: query.trim(),
  },
});
