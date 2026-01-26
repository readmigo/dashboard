import { fetchUtils, DataProvider } from 'react-admin';
import { getStoredContentLanguage } from '../contexts/ContentLanguageContext';
import { getStoredEnvironment } from '../contexts/EnvironmentContext';
import { getApiUrl } from '../config/environments';

// Debug logging helper - uses global debug log if available
const debugLog = (message: string, data?: unknown) => {
  if (typeof window !== 'undefined' && window.__DEBUG_LOG__) {
    window.__DEBUG_LOG__('data', `[DataProvider] ${message}`, data);
  } else {
    console.log(`[DataProvider] ${message}`, data !== undefined ? data : '');
  }
};

// Helper to safely stringify data for logging (handles circular refs)
const safeStringify = (obj: unknown, maxDepth = 3): unknown => {
  if (maxDepth <= 0) return '[MAX_DEPTH]';
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.slice(0, 5).map(item => safeStringify(item, maxDepth - 1));
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>).slice(0, 20)) {
    result[key] = safeStringify(value, maxDepth - 1);
  }
  return result;
};

/**
 * Get the current API URL based on stored environment
 */
const getApiBaseUrl = (): string => {
  const env = getStoredEnvironment();
  return getApiUrl(env);
};

const httpClient = async (url: string, options: fetchUtils.Options = {}) => {
  const token = localStorage.getItem('adminToken');
  const contentLanguage = getStoredContentLanguage();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Admin mode headers - Dashboard always operates in admin mode
  headers.set('X-Admin-Mode', 'true');
  headers.set('X-Content-Filter', contentLanguage);

  // Debug: Log request details
  debugLog(`Request: ${options.method || 'GET'} ${url}`, { hasToken: !!token, contentLanguage });

  try {
    const response = await fetchUtils.fetchJson(url, { ...options, headers });
    debugLog(`Response OK: ${url}`, { status: response.status });
    return response;
  } catch (error: unknown) {
    // Enhanced error logging
    const err = error as { status?: number; body?: unknown; message?: string };
    debugLog(`Request FAILED: ${url}`, {
      status: err.status,
      body: err.body,
      message: err.message,
    });
    throw error;
  }
};

/**
 * Get the appropriate API path for a resource
 * Some resources have different API paths
 */
const getResourceApiPath = (resource: string): string => {
  const baseUrl = getApiBaseUrl();

  // Special handling for import batches - uses /admin/import/batches
  if (resource === 'import/batches') {
    return `${baseUrl}/admin/import/batches`;
  }

  // Map messages to messages/threads for API calls
  if (resource === 'messages') {
    return `${baseUrl}/api/v1/admin/messages/threads`;
  }

  // Default: /api/v1/admin/{resource}
  return `${baseUrl}/api/v1/admin/${resource}`;
};

export const dataProvider: DataProvider = {
  // Override methods to use dynamic API URL
  getList: async (resource, params) => {
    debugLog(`getList called for resource: ${resource}`, { params: safeStringify(params) });

    const resourceUrl = getResourceApiPath(resource);
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: 'id', order: 'DESC' };

    // Get content language filter
    const contentLanguage = getStoredContentLanguage();

    const query: Record<string, unknown> = {
      page,
      limit: perPage,
      sortBy: field,
      sortOrder: order.toLowerCase(),
      ...params.filter,
    };

    // Add contentLanguage filter for content resources that support it (not 'all')
    // Exclude support-related resources that don't use content language filtering
    const resourcesWithoutContentLanguage = [
      'tickets',
      'feedback',
      'orders',
      'support/dashboard',
      'guest-feedback',
      'messages',
    ];
    const shouldAddContentLanguage =
      contentLanguage !== 'all' &&
      !resourcesWithoutContentLanguage.some((r) => resource.includes(r));

    if (shouldAddContentLanguage) {
      query.contentLanguage = contentLanguage;
    }

    const queryString = Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const url = `${resourceUrl}?${queryString}`;
    const { json } = await httpClient(url);

    // Log FULL raw response for debugging
    debugLog(`getList FULL raw response for ${resource}`, {
      responseType: typeof json,
      isArray: Array.isArray(json),
      jsonKeys: json && typeof json === 'object' ? Object.keys(json) : 'N/A',
      total: json?.total,
      itemsType: typeof json?.items,
      itemsIsArray: Array.isArray(json?.items),
      itemsCount: json?.items?.length,
      ticketsType: typeof json?.tickets,
      ticketsIsArray: Array.isArray(json?.tickets),
      ticketsCount: json?.tickets?.length,
      dataType: typeof json?.data,
      dataIsArray: Array.isArray(json?.data),
      dataCount: json?.data?.length,
      rawJsonPreview: safeStringify(json, 2),
    });

    // Support different response formats: items, tickets, feedbacks, orders, etc.
    const data = json.items || json.tickets || json.feedbacks || json.orders || json.data || json;

    // Log extracted data info
    debugLog(`getList extracted data for ${resource}`, {
      dataType: typeof data,
      isArray: Array.isArray(data),
      dataLength: Array.isArray(data) ? data.length : 'N/A',
      firstItemPreview: Array.isArray(data) && data.length > 0 ? safeStringify(data[0], 2) : null,
    });

    // Log processed data
    if (Array.isArray(data) && data.length > 0) {
      const firstRecord = data[0];
      debugLog(`getList first record for ${resource}`, {
        id: firstRecord.id,
        keys: Object.keys(firstRecord),
        dateFields: {
          createdAt: { value: firstRecord.createdAt, type: typeof firstRecord.createdAt },
          updatedAt: { value: firstRecord.updatedAt, type: typeof firstRecord.updatedAt },
          closedAt: { value: firstRecord.closedAt, type: typeof firstRecord.closedAt },
        },
      });
    }

    return {
      data: Array.isArray(data) ? data : [],
      total: json.total ?? (Array.isArray(data) ? data.length : 0),
    };
  },

  getOne: async (resource, params) => {
    debugLog(`getOne called for resource: ${resource}`, { id: params.id });

    const resourceUrl = getResourceApiPath(resource);
    const { json } = await httpClient(`${resourceUrl}/${params.id}`);

    // Log response details for debugging
    debugLog(`getOne response for ${resource}/${params.id}`, {
      keys: Object.keys(json),
      dateFields: {
        createdAt: { value: json.createdAt, type: typeof json.createdAt },
        updatedAt: { value: json.updatedAt, type: typeof json.updatedAt },
        closedAt: { value: json.closedAt, type: typeof json.closedAt },
      },
      messagesCount: json.messages?.length,
      firstMessage: json.messages?.[0] ? {
        id: json.messages[0].id,
        createdAt: json.messages[0].createdAt,
        createdAtType: typeof json.messages[0].createdAt,
      } : null,
    });

    return { data: json };
  },

  getMany: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const query = params.ids.map(id => `id=${encodeURIComponent(id)}`).join('&');
    const { json } = await httpClient(`${resourceUrl}?${query}`);
    // Support different response formats
    const data = json.items || json.tickets || json.feedbacks || json.orders || json.data || json;
    return { data: Array.isArray(data) ? data : [] };
  },

  getManyReference: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: 'id', order: 'DESC' };

    const query = {
      page,
      limit: perPage,
      sortBy: field,
      sortOrder: order.toLowerCase(),
      [params.target]: params.id,
      ...params.filter,
    };

    const queryString = Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const url = `${resourceUrl}?${queryString}`;
    const { json } = await httpClient(url);

    // Support different response formats
    const data = json.items || json.tickets || json.feedbacks || json.orders || json.data || json;

    return {
      data: Array.isArray(data) ? data : [],
      total: json.total ?? (Array.isArray(data) ? data.length : 0),
    };
  },

  create: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const { json } = await httpClient(resourceUrl, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  update: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const { json } = await httpClient(`${resourceUrl}/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  updateMany: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const responses = await Promise.all(
      params.ids.map(id =>
        httpClient(`${resourceUrl}/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(params.data),
        })
      )
    );
    return { data: responses.map(({ json }) => json.id) };
  },

  delete: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const { json } = await httpClient(`${resourceUrl}/${params.id}`, {
      method: 'DELETE',
    });
    return { data: json };
  },

  deleteMany: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const responses = await Promise.all(
      params.ids.map(id =>
        httpClient(`${resourceUrl}/${id}`, {
          method: 'DELETE',
        })
      )
    );
    return { data: responses.map(({ json }) => json.id) };
  },

  // Custom methods
  publishBook: async (id: string) => {
    const apiUrl = `${getApiBaseUrl()}/api/v1/admin`;
    const { json } = await httpClient(`${apiUrl}/books/${id}/publish`, {
      method: 'POST',
    });
    return { data: json };
  },
};
