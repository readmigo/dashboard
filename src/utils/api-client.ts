import { fetchUtils } from 'react-admin';
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
