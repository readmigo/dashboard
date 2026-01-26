import polyglotI18nProvider from 'ra-i18n-polyglot';
import { englishTranslations } from './en';
import { chineseTranslations } from './zh-Hans';
import { traditionalChineseTranslations } from './zh-Hant';

export type SupportedLocale = 'en' | 'zh-Hans' | 'zh-Hant';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translations: Record<SupportedLocale, any> = {
  en: englishTranslations,
  'zh-Hans': chineseTranslations,
  'zh-Hant': traditionalChineseTranslations,
};

/**
 * Detect the default locale based on browser settings
 */
export const detectLocale = (): SupportedLocale => {
  const browserLang = navigator.language || (navigator as any).userLanguage;

  if (browserLang.startsWith('zh')) {
    // Check for Traditional Chinese variants
    if (
      browserLang === 'zh-TW' ||
      browserLang === 'zh-HK' ||
      browserLang === 'zh-Hant'
    ) {
      return 'zh-Hant';
    }
    return 'zh-Hans';
  }

  return 'en';
};

/**
 * Get stored locale from localStorage
 */
export const getStoredLocale = (): SupportedLocale | null => {
  const stored = localStorage.getItem('locale');
  if (stored === 'en' || stored === 'zh-Hans' || stored === 'zh-Hant') {
    return stored;
  }
  return null;
};

/**
 * Store locale in localStorage
 */
export const setStoredLocale = (locale: SupportedLocale): void => {
  localStorage.setItem('locale', locale);
};

/**
 * Get the initial locale
 */
export const getInitialLocale = (): SupportedLocale => {
  return getStoredLocale() || detectLocale();
};

/**
 * Create the i18n provider for react-admin
 */
export const i18nProvider = polyglotI18nProvider(
  (locale: string) => translations[locale as SupportedLocale] || translations.en,
  getInitialLocale(),
  [
    { locale: 'en', name: 'English' },
    { locale: 'zh-Hans', name: '简体中文' },
    { locale: 'zh-Hant', name: '繁體中文' },
  ],
);

export { englishTranslations, chineseTranslations, traditionalChineseTranslations };
