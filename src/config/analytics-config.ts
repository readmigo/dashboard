/**
 * PostHog Analytics API Configuration
 * Used for querying operational data via HogQL
 */

export const POSTHOG_CONFIG = {
  host: 'https://us.posthog.com',
  projectId: '312868',
  // Personal API Key (All Access) - for management API queries
  personalApiKey: import.meta.env.VITE_POSTHOG_PERSONAL_API_KEY || '',
  // Project API Key - for SDK event capture only
  projectApiKey: 'phc_ChsWRAqbh0LOxd0jmyBLem5oSa1ffqobQZfs5FXc2X0',
} as const;

export const POSTHOG_API = {
  query: `${POSTHOG_CONFIG.host}/api/projects/${POSTHOG_CONFIG.projectId}/query/`,
  dashboards: `${POSTHOG_CONFIG.host}/api/projects/${POSTHOG_CONFIG.projectId}/dashboards/`,
  eventDefinitions: `${POSTHOG_CONFIG.host}/api/projects/${POSTHOG_CONFIG.projectId}/event_definitions/`,
} as const;

export const POSTHOG_DASHBOARDS = {
  audiobookHealth: 1329171,
  coreMetrics: 1329200,
  subscriptionRevenue: 1329201,
  readingAnalytics: 1329202,
  featureAdoption: 1329203,
  onboardingFunnel: 1329204,
  community: 1329206,
  bookRankings: 1329231,
  platformComparison: 1329229,
  thoughtsAnalytics: 1339801,
} as const;

/** All tracked event names in PostHog */
export const POSTHOG_EVENTS = {
  // Lifecycle
  appInstalled: 'Application Installed',
  appOpened: 'Application Opened',
  appBackgrounded: 'Application Backgrounded',
  appUpdated: 'Application Updated',
  deepLinkOpened: 'Deep Link Opened',
  screen: '$screen',

  // Onboarding
  onboardingStarted: 'onboarding_started',
  onboardingStepCompleted: 'onboarding_step_completed',
  onboardingCompleted: 'onboarding_completed',

  // Auth
  userSignup: 'user_signup',
  userLogin: 'user_login',
  userLoggedIn: 'user_logged_in',
  userLoggedOut: 'user_logged_out',
  userLogout: 'user_logout',

  // Reading
  readingStarted: 'reading_started',
  readingSessionEnded: 'reading_session_ended',
  chapterNavigated: 'chapter_navigated',
  readerSettingChanged: 'reader_setting_changed',

  // Audiobook
  audiobookStarted: 'audiobook_started',
  audiobookLoadStarted: 'audiobook_load_started',
  audiobookPlayStarted: 'audiobook_play_started',
  audiobookPlayEnded: 'audiobook_play_ended',
  audiobookSessionEnded: 'audiobook_session_ended',

  // TTS
  ttsStarted: 'tts_started',
  ttsStopped: 'tts_stopped',

  // Annotations
  bookmarkCreated: 'bookmark_created',
  bookmarkDeleted: 'bookmark_deleted',
  highlightCreated: 'highlight_created',
  highlightDeleted: 'highlight_deleted',

  // Monetization
  paywallViewed: 'paywall_viewed',
  paywallDismissed: 'paywall_dismissed',
  purchaseInitiated: 'purchase_initiated',
  subscriptionPurchased: 'subscription_purchased',
  billingQueryProductsSuccess: 'billing_query_products_success',

  // Social
  agoraPostLiked: 'agora_post_liked',
  appReviewRequested: 'app_review_requested',
} as const;

/** Default time ranges for analytics queries */
export const TIME_RANGES = {
  last7d: '-7d',
  last30d: '-30d',
  last90d: '-90d',
} as const;

/**
 * Internal test user IDs to exclude from analytics
 * Identified by: 4+ app versions used, is_internal=true flag, dev device names
 */
export const INTERNAL_USER_IDS = [
  '88952c83-83f1-4bdc-a7a0-85f3c3e4c2ab', // iOS/iPad multi-version tester (10 versions, 8854 events)
  'a14b013d-fd4c-4f23-91e0-41e0dcf92417',  // Android Pixel 3a dev device (11 versions, 898 events)
  '7ca8da67-4861-4267-a1b5-be3b357b438d',  // Android OnePlus8Pro tester (7 versions, 132 events)
] as const;

/** HogQL WHERE clause to exclude internal users */
export const EXCLUDE_INTERNAL_CLAUSE =
  INTERNAL_USER_IDS.map((id) => `'${id}'`).join(', ');

/** User locale → language group mapping */
export const LOCALE_TO_LANGUAGE: Record<string, string> = {
  en: 'English', 'en-US': 'English', 'en-GB': 'English', 'en-AU': 'English',
  'en-CA': 'English', 'en-IN': 'English', 'en-NZ': 'English', 'en-IE': 'English',
  'en-ZA': 'English', 'en-SG': 'English', 'en-PH': 'English', 'en-PK': 'English',
  'en-MY': 'English', 'en-JM': 'English', 'en-KE': 'English', 'en-TT': 'English',
  'en-TR': 'English',
  zh: 'Chinese', 'zh-CN': 'Chinese', 'zh-TW': 'Chinese', 'zh-HK': 'Chinese',
  ru: 'Russian', 'ru-RU': 'Russian', 'ru-KZ': 'Russian',
  es: 'Spanish', 'es-ES': 'Spanish', 'es-US': 'Spanish', 'es-AR': 'Spanish',
  pt: 'Portuguese', 'pt-BR': 'Portuguese',
  fr: 'French', 'fr-FR': 'French', 'fr-DZ': 'French',
  ko: 'Korean', 'ko-KR': 'Korean',
  ja: 'Japanese', 'ja-JP': 'Japanese',
  tr: 'Turkish', 'tr-TR': 'Turkish',
  ar: 'Arabic', 'ar-EG': 'Arabic',
  de: 'German', 'de-DE': 'German',
  uk: 'Ukrainian', 'uk-UA': 'Ukrainian',
  he: 'Hebrew', 'he-IL': 'Hebrew',
  nl: 'Dutch', 'nl-NL': 'Dutch',
  vi: 'Vietnamese', 'vi-VN': 'Vietnamese',
  fa: 'Persian', 'fa-IR': 'Persian',
};

/**
 * All data sources available for cross-validation
 */
export const DATA_SOURCES = {
  posthog: {
    name: 'PostHog',
    type: 'product-analytics',
    queryMethod: 'HogQL',
    strengths: ['funnels', 'retention', 'feature-flags', 'session-replay'],
    uniqueData: ['client-side events', 'screen flows'],
  },
  selfBuilt: {
    name: 'Self-Built (API DB)',
    type: 'source-of-truth',
    queryMethod: 'REST API',
    apiBase: 'https://api.readmigo.app/api/v1',
    endpoints: {
      overview: '/admin/operations/overview',
      dailyTrend: '/admin/operations/daily-trend',
      hotBooks: '/admin/operations/hot-content/books',
      versionStats: '/admin/operations/version-stats',
      eventAnalytics: '/admin/operations/event-analytics/overview',
    },
    strengths: ['precise reading duration', 'word counts', 'daily streaks'],
    uniqueData: ['reading minutes precision', 'AI token usage', 'server-side ground truth'],
  },
  amplitude: {
    name: 'Amplitude',
    type: 'product-analytics',
    queryMethod: 'SDK',
    strengths: ['alternative retention calc', 'cohort analysis'],
    uniqueData: ['different sampling strategy'],
  },
  sentry: {
    name: 'Sentry',
    type: 'error-tracking',
    apiBase: 'https://us.sentry.io/api/0',
    strengths: ['crash reports', 'performance monitoring', 'release health'],
    uniqueData: ['stack traces', 'API latency', 'error rates'],
  },
  checkly: {
    name: 'Checkly',
    type: 'uptime-monitoring',
    strengths: ['multi-region latency', 'uptime tracking'],
    uniqueData: ['API availability from 4 regions'],
  },
} as const;
