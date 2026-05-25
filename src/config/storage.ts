// Single source of truth for browser-storage keys used across the app.
// Values are intentionally stable — changing them invalidates existing
// sessions and persisted preferences.

// Persisted in localStorage (survive browser restarts).
export const LOCAL_STORAGE_KEYS = {
  environment: 'dashboard_environment',
  timezone: 'dashboard_timezone',
  contentLanguage: 'contentLanguage',
  locale: 'locale',
} as const;

// Held in sessionStorage (cleared when the tab closes).
export const SESSION_STORAGE_KEYS = {
  token: 'adminToken',
  user: 'adminUser',
} as const;
