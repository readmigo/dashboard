import type { DataProvider } from 'react-admin';
import { getStoredContentLanguage } from '../stores/appStore';
import { normalizeListResponse } from '../types/api';
import { adminHttpClient, getApiBaseUrl } from '../utils/api-client';
import { logger } from '../utils/logger';

const RESOURCES_WITHOUT_CONTENT_LANGUAGE: readonly string[] = [
  'tickets',
  'feedback',
  'orders',
  'support/dashboard',
  'guest-feedback',
  'messages',
];

const RESOURCE_PATH_OVERRIDES: Record<string, (base: string) => string> = {
  'import/batches': (base) => `${base}/admin/import/batches`,
  messages: (base) => `${base}/api/v1/admin/messages/threads`,
};

const getResourceApiPath = (resource: string): string => {
  const base = getApiBaseUrl();
  const override = RESOURCE_PATH_OVERRIDES[resource];
  return override ? override(base) : `${base}/api/v1/admin/${resource}`;
};

const httpClient = adminHttpClient;

const shouldFilterByContentLanguage = (resource: string, contentLanguage: string): boolean =>
  contentLanguage !== 'all' &&
  !RESOURCES_WITHOUT_CONTENT_LANGUAGE.some((r) => resource.includes(r));

const buildQueryString = (query: Record<string, unknown>): string =>
  Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const { page, perPage } = params.pagination ?? { page: 1, perPage: 10 };
    const { field, order } = params.sort ?? { field: 'id', order: 'DESC' };
    const contentLanguage = getStoredContentLanguage();

    const query: Record<string, unknown> = {
      page,
      limit: perPage,
      sortBy: field,
      sortOrder: order.toLowerCase(),
      ...params.filter,
    };
    if (shouldFilterByContentLanguage(resource, contentLanguage)) {
      query.contentLanguage = contentLanguage;
    }

    const url = `${resourceUrl}?${buildQueryString(query)}`;
    const { json } = await httpClient(url);
    return normalizeListResponse(json);
  },

  getOne: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const { json } = await httpClient(`${resourceUrl}/${params.id}`);
    return { data: json };
  },

  getMany: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const query = params.ids.map((id) => `id=${encodeURIComponent(String(id))}`).join('&');
    const { json } = await httpClient(`${resourceUrl}?${query}`);
    return { data: normalizeListResponse(json).data };
  },

  getManyReference: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const { page, perPage } = params.pagination ?? { page: 1, perPage: 10 };
    const { field, order } = params.sort ?? { field: 'id', order: 'DESC' };

    const query: Record<string, unknown> = {
      page,
      limit: perPage,
      sortBy: field,
      sortOrder: order.toLowerCase(),
      [params.target]: params.id,
      ...params.filter,
    };

    const url = `${resourceUrl}?${buildQueryString(query)}`;
    const { json } = await httpClient(url);
    return normalizeListResponse(json);
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
      params.ids.map((id) =>
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
    const { json } = await httpClient(`${resourceUrl}/${params.id}`, { method: 'DELETE' });
    return { data: json };
  },

  deleteMany: async (resource, params) => {
    const resourceUrl = getResourceApiPath(resource);
    const responses = await Promise.all(
      params.ids.map((id) => httpClient(`${resourceUrl}/${id}`, { method: 'DELETE' }))
    );
    return { data: responses.map(({ json }) => json.id) };
  },

  publishBook: async (id: string) => {
    const url = `${getApiBaseUrl()}/api/v1/admin/books/${id}/publish`;
    logger.info(`Publishing book ${id}`);
    const { json } = await httpClient(url, { method: 'POST' });
    return { data: json };
  },
};
