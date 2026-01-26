import { useState, useEffect, useCallback } from 'react';
import { useEnvironment } from '../../../contexts/EnvironmentContext';

export interface BooklistInfo {
  path: string;
  name: string;
  bookCount: number;
  lastModified: string;
  sections?: string[];
}

export interface BooklistPreview {
  path: string;
  totalBooks: number;
  uniqueBooks: number;
  duplicates: number;
  sections: { name: string; count: number }[];
  sampleBooks: { title: string; author: string; section?: string }[];
}

export function useBooklists() {
  const { apiBaseUrl } = useEnvironment();
  const [booklists, setBooklists] = useState<BooklistInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooklists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/v1/admin/pipeline/booklists`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Mode': 'true',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch booklists: ${response.statusText}`);
      }
      const data = await response.json();
      setBooklists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchBooklists();
  }, [fetchBooklists]);

  const previewBooklist = useCallback(
    async (path: string): Promise<BooklistPreview | null> => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${apiBaseUrl}/api/v1/admin/pipeline/booklists/${encodeURIComponent(path)}/preview`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'X-Admin-Mode': 'true',
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to preview booklist: ${response.statusText}`);
        }
        return await response.json();
      } catch (err) {
        console.error('Preview error:', err);
        return null;
      }
    },
    [apiBaseUrl]
  );

  return {
    booklists,
    loading,
    error,
    refresh: fetchBooklists,
    previewBooklist,
  };
}
