import { fetchUtils } from 'react-admin';
import { getApiUrl } from '@/config/environments';
import { getStoredContentLanguage, getStoredEnvironment } from '@/stores/appStore';
import { SESSION_STORAGE_KEYS } from '@/config/storage';
import { ApiError, ApiErrorBody } from '@/types/api';
import { logger } from './logger';

type FetchJsonResult = Awaited<ReturnType<typeof fetchUtils.fetchJson>>;
type HttpHeaderInit = HeadersInit | undefined;

export interface HttpOptions extends fetchUtils.Options {
  headers?: HttpHeaderInit;
}

const isApiErrorShape = (e: unknown): e is { status?: number; body?: unknown; message?: string } =>
  typeof e === 'object' && e !== null;

export const httpRequest = async (url: string, options: HttpOptions = {}): Promise<FetchJsonResult> => {
  const method = options.method ?? 'GET';
  logger.data(`HTTP ${method} ${url}`);
  try {
    const response = await fetchUtils.fetchJson(url, options);
    logger.data(`HTTP ${method} ${url} ← ${response.status}`);
    return response;
  } catch (error: unknown) {
    if (!isApiErrorShape(error)) {
      logger.error(`HTTP ${method} ${url} ✗ unknown error`, error);
      throw error;
    }
    const status = error.status ?? 0;
    const message = error.message ?? `HTTP ${method} ${url} failed`;
    logger.error(`HTTP ${method} ${url} ✗ ${status}`, { body: error.body, message });
    throw new ApiError(message, {
      status,
      body: (error.body as ApiErrorBody | undefined) ?? null,
      url,
    });
  }
};

export const getApiBaseUrl = (): string => getApiUrl(getStoredEnvironment());

export const buildAuthHeaders = (extra?: Record<string, string>): Headers => {
  const headers = new Headers();
  const token = sessionStorage.getItem(SESSION_STORAGE_KEYS.token);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-Admin-Mode', 'true');
  headers.set('X-Content-Filter', getStoredContentLanguage());
  if (extra) {
    for (const [key, value] of Object.entries(extra)) headers.set(key, value);
  }
  return headers;
};

export const adminHttpClient = (url: string, options: { method?: string; body?: string } = {}) =>
  httpRequest(url, { ...options, headers: buildAuthHeaders() });

export interface AdminFetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

// Single page-level client: shares auth headers, logging, and ApiError
// normalization with the react-admin dataProvider, and returns the parsed body.
export const adminFetch = async <T = unknown>(path: string, options: AdminFetchOptions = {}): Promise<T> => {
  const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path}`;
  const { json } = await httpRequest(url, {
    method: options.method,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    headers: buildAuthHeaders(options.headers),
  });
  return json as T;
};
