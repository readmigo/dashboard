import { useState, useEffect, useCallback, useRef } from 'react';
import { useEnvironment } from '../../../contexts/EnvironmentContext';

export interface PipelineProgress {
  total: number;
  completed: number;
  skipped: number;
  failed: number;
  percentage: number;
}

export interface CurrentBook {
  title: string;
  author: string;
  status: string;
}

export interface PipelineStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStage: string;
  currentStageName: string;
  progress: PipelineProgress;
  currentBook?: CurrentBook;
  startTime: string;
  elapsedSeconds: number;
}

export interface BookStatus {
  title: string;
  author: string;
  status: string;
  bookId?: string;
  chaptersCount?: number;
  error?: string;
  stage?: string;
}

export interface PipelineReport {
  batchId: string;
  environment: string;
  booklistFile: string;
  startTime: string;
  endTime: string;
  duration: number;
  summary: {
    total: number;
    matched: number;
    imported: number;
    skipped: number;
    failed: number;
  };
  storage: {
    chaptersUploaded: number;
    coversUploaded: number;
    totalSize: number;
  };
  relatedData: {
    authors: { created: number; updated: number; timelineEvents: number; quotes: number };
    categories: { bookCategories: number; categoriesUpdated: number };
    bookStats: { created: number; scores: number };
    content: { bookContexts: number; readingGuides: number; quotes: number };
    characters: { characters: number; relationships: number; graphs: number; events: number };
    agora: { posts: number };
    bookLists: { created: number; items: number };
  };
  healthCheck: {
    apiHealth: boolean;
    sampleVerification: boolean;
    issues: string[];
  };
  failures: { book: { title: string; author: string }; stage: string; error: string }[];
  apiEndpoint: string;
}

export function usePipelineStatus(pipelineId: string | null, pollInterval = 2000) {
  const { apiBaseUrl } = useEnvironment();
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [books, setBooks] = useState<BookStatus[]>([]);
  const [report, setReport] = useState<PipelineReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!pipelineId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/v1/admin/pipeline/${pipelineId}/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Mode': 'true',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }
      const data: PipelineStatus = await response.json();
      setStatus(data);
      setError(null);

      // If completed or failed, fetch report
      if (data.status === 'completed' || data.status === 'failed') {
        fetchReport();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [apiBaseUrl, pipelineId]);

  const fetchBooks = useCallback(async () => {
    if (!pipelineId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/v1/admin/pipeline/${pipelineId}/books`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Mode': 'true',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }
      const data = await response.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error('Fetch books error:', err);
    }
  }, [apiBaseUrl, pipelineId]);

  const fetchReport = useCallback(async () => {
    if (!pipelineId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/v1/admin/pipeline/${pipelineId}/report`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Mode': 'true',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`);
      }
      const data: PipelineReport = await response.json();
      setReport(data);
    } catch (err) {
      console.error('Fetch report error:', err);
    }
  }, [apiBaseUrl, pipelineId]);

  const cancelPipeline = useCallback(async () => {
    if (!pipelineId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/v1/admin/pipeline/${pipelineId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Mode': 'true',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to cancel pipeline: ${response.statusText}`);
      }
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [apiBaseUrl, pipelineId, fetchStatus]);

  // Start polling when pipeline is running
  useEffect(() => {
    if (!pipelineId) {
      setStatus(null);
      setBooks([]);
      setReport(null);
      return;
    }

    setLoading(true);
    fetchStatus();
    fetchBooks();
    setLoading(false);

    // Poll while running
    intervalRef.current = setInterval(() => {
      if (status?.status === 'running' || status?.status === 'pending') {
        fetchStatus();
        fetchBooks();
      }
    }, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pipelineId, pollInterval, fetchStatus, fetchBooks, status?.status]);

  return {
    status,
    books,
    report,
    loading,
    error,
    cancelPipeline,
    refresh: fetchStatus,
  };
}
