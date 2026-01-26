import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ContentFilter } from '../config/environments';

interface ContentContextType {
  contentFilter: ContentFilter;
  setContentFilter: (filter: ContentFilter) => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

const STORAGE_KEY = 'dashboard_content_filter';

/**
 * Get stored content filter from localStorage
 */
const getStoredContentFilter = (): ContentFilter => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'all' || stored === 'en' || stored === 'zh') {
    return stored;
  }
  return 'all';
};

/**
 * Store content filter in localStorage
 */
const setStoredContentFilter = (filter: ContentFilter): void => {
  localStorage.setItem(STORAGE_KEY, filter);
};

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider = ({ children }: ContentProviderProps) => {
  const [contentFilter, setContentFilterState] = useState<ContentFilter>(getStoredContentFilter);

  const setContentFilter = useCallback((filter: ContentFilter) => {
    setContentFilterState(filter);
    setStoredContentFilter(filter);
    // Dispatch event for components that need to refetch
    window.dispatchEvent(new CustomEvent('content-filter-changed', { detail: { filter } }));
  }, []);

  return (
    <ContentContext.Provider value={{ contentFilter, setContentFilter }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContentFilter = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContentFilter must be used within a ContentProvider');
  }
  return context;
};

export { ContentContext };
export type { ContentFilter };
