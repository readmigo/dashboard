import { fetchUtils } from 'react-admin';
import { getApiUrl } from '../config/environments';
import { getStoredContentLanguage, getStoredEnvironment } from '../stores/appStore';
import { ApiError, ApiErrorBody } from '../types/api';
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

export const buildAuthHeaders = (): Headers => {
  const headers = new Headers();
  const token = sessionStorage.getItem('adminToken');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-Admin-Mode', 'true');
  headers.set('X-Content-Filter', getStoredContentLanguage());
  return headers;
};

export const adminHttpClient = (url: string, options: { method?: string; body?: string } = {}) =>
  httpRequest(url, { ...options, headers: buildAuthHeaders() });

export interface AdminFetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export const adminFetch = async <T = unknown>(path: string, options: AdminFetchOptions = {}): Promise<T> => {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  const token = sessionStorage.getItem('adminToken');

  const headers: Record<string, string> = {
    'X-Admin-Mode': 'true',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
};
