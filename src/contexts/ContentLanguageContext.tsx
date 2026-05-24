import { useShallow } from 'zustand/react/shallow';
import { ContentLanguage, useAppStore } from '../stores/appStore';

export type { ContentLanguage };
export { getStoredContentLanguage } from '../stores/appStore';

export interface ContentLanguageHookValue {
  contentLanguage: ContentLanguage;
  setContentLanguage: (lang: ContentLanguage) => void;
}

export const useContentLanguage = (): ContentLanguageHookValue =>
  useAppStore(
    useShallow((s) => ({
      contentLanguage: s.contentLanguage,
      setContentLanguage: s.setContentLanguage,
    }))
  );
