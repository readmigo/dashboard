import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type ContentLanguage = 'all' | 'en' | 'zh';

interface ContentLanguageContextType {
  contentLanguage: ContentLanguage;
  setContentLanguage: (lang: ContentLanguage) => void;
}

const ContentLanguageContext = createContext<ContentLanguageContextType>({
  contentLanguage: 'en',
  setContentLanguage: () => {},
});

const STORAGE_KEY = 'contentLanguage';

/**
 * Get stored content language from localStorage
 */
export const getStoredContentLanguage = (): ContentLanguage => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'all' || stored === 'en' || stored === 'zh') {
    return stored;
  }
  return 'en';
};

/**
 * Store content language in localStorage
 */
export const setStoredContentLanguage = (lang: ContentLanguage): void => {
  localStorage.setItem(STORAGE_KEY, lang);
};

interface ContentLanguageProviderProps {
  children: ReactNode;
}

export const ContentLanguageProvider = ({ children }: ContentLanguageProviderProps) => {
  const [contentLanguage, setContentLanguageState] = useState<ContentLanguage>(
    getStoredContentLanguage
  );

  const setContentLanguage = useCallback((lang: ContentLanguage) => {
    setContentLanguageState(lang);
    setStoredContentLanguage(lang);
    // Dispatch event for components that need to refetch
    window.dispatchEvent(new CustomEvent('content-language-changed', { detail: { language: lang } }));
  }, []);

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = getStoredContentLanguage();
    if (stored !== contentLanguage) {
      setContentLanguageState(stored);
    }
  }, []);

  return (
    <ContentLanguageContext.Provider value={{ contentLanguage, setContentLanguage }}>
      {children}
    </ContentLanguageContext.Provider>
  );
};

export const useContentLanguage = () => {
  const context = useContext(ContentLanguageContext);
  if (!context) {
    throw new Error('useContentLanguage must be used within a ContentLanguageProvider');
  }
  return context;
};

export { ContentLanguageContext };
