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
