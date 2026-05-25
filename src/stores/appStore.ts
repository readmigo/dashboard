import { create } from 'zustand';
import { Environment } from '@/config/environments';
import { DEFAULT_TIMEZONE, isValidTimezoneId } from '@/config/timezones';
import { LOCAL_STORAGE_KEYS } from '@/config/storage';

export type ContentLanguage = 'all' | 'en' | 'zh';

export const STORAGE_KEYS = LOCAL_STORAGE_KEYS;

const ENVIRONMENT_CHANGE_DEBOUNCE_MS = 100;

const safeGet = (key: string): string | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string): void => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  } catch {
    /* localStorage may be unavailable (e.g. private mode) */
  }
};

const isEnvironment = (v: string | null): v is Environment =>
  v === 'local' || v === 'production';
const isContentLanguage = (v: string | null): v is ContentLanguage =>
  v === 'all' || v === 'en' || v === 'zh';

const readEnvironment = (): Environment => {
  const v = safeGet(STORAGE_KEYS.environment);
  return isEnvironment(v) ? v : 'production';
};
const readTimezone = (): string => {
  const v = safeGet(STORAGE_KEYS.timezone);
  return isValidTimezoneId(v) ? v : DEFAULT_TIMEZONE;
};
const readContentLanguage = (): ContentLanguage => {
  const v = safeGet(STORAGE_KEYS.contentLanguage);
  return isContentLanguage(v) ? v : 'en';
};

export interface AppState {
  environment: Environment;
  timezone: string;
  contentLanguage: ContentLanguage;
  environmentChanging: boolean;
  setEnvironment: (env: Environment) => void;
  setTimezone: (tz: string) => void;
  setContentLanguage: (lang: ContentLanguage) => void;
}

export const useAppStore = create<AppState>((set) => ({
  environment: readEnvironment(),
  timezone: readTimezone(),
  contentLanguage: readContentLanguage(),
  environmentChanging: false,

  setEnvironment: (env) => {
    safeSet(STORAGE_KEYS.environment, env);
    set({ environment: env, environmentChanging: true });
    // Brief loading flag gives the UI a chance to react before pages re-fetch.
    setTimeout(() => {
      set({ environmentChanging: false });
    }, ENVIRONMENT_CHANGE_DEBOUNCE_MS);
  },

  setTimezone: (tz) => {
    safeSet(STORAGE_KEYS.timezone, tz);
    set({ timezone: tz });
  },

  setContentLanguage: (lang) => {
    safeSet(STORAGE_KEYS.contentLanguage, lang);
    set({ contentLanguage: lang });
  },
}));

// Non-React accessors for services (dataProvider, authProvider, …).
export const getStoredEnvironment = (): Environment => useAppStore.getState().environment;
export const getStoredTimezone = (): string => useAppStore.getState().timezone;
export const getStoredContentLanguage = (): ContentLanguage =>
  useAppStore.getState().contentLanguage;
