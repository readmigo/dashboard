export interface ApiErrorBody {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;
  readonly url: string;

  constructor(message: string, opts: { status: number; body: ApiErrorBody | null; url: string }) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.body = opts.body;
    this.url = opts.url;
  }
}

// Legacy admin endpoints return list payloads under several keys.
// TODO(backend): once everything returns `{ items, total }`, drop the fallbacks.
export interface ListResponse<T = unknown> {
  items?: T[];
  data?: T[];
  total?: number;
  tickets?: T[];
  feedbacks?: T[];
  orders?: T[];
}

export interface NormalizedListResponse<T> {
  data: T[];
  total: number;
}

// Default T to `any` so the result is assignable to react-admin's parametric
// `GetListResult<RecordType>`. Callers wanting a stricter type can pass an explicit T.
export const normalizeListResponse = <T = any>(
  json: ListResponse<T> | T[] | null | undefined
): NormalizedListResponse<T> => {
  if (Array.isArray(json)) {
    return { data: json, total: json.length };
  }
  if (json == null || typeof json !== 'object') {
    return { data: [], total: 0 };
  }
  const data =
    json.items ?? json.data ?? json.tickets ?? json.feedbacks ?? json.orders ?? [];
  const arr = (Array.isArray(data) ? data : []) as T[];
  return {
    data: arr,
    total: json.total ?? arr.length,
  };
};
