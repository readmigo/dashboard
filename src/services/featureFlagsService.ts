import { Environment } from '../contexts/EnvironmentContext';

const API_URL = '/api/v1';

interface FeatureFlag {
  id: string;
  key: string;
  environment: Environment;
  value: Record<string, unknown>;
  description?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

interface UpdateFlagData {
  isEnabled?: boolean;
  value?: Record<string, unknown>;
  description?: string;
}

interface CreateFlagData {
  key: string;
  environment: Environment;
  value: Record<string, unknown>;
  description?: string;
  isEnabled?: boolean;
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const featureFlagsService = {
  async getFlags(environment?: Environment): Promise<FeatureFlag[]> {
    const url = environment
      ? `${API_URL}/config/admin/flags?environment=${environment}`
      : `${API_URL}/config/admin/flags`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch feature flags');
    }

    return response.json();
  },

  async createFlag(data: CreateFlagData): Promise<FeatureFlag> {
    const response = await fetch(`${API_URL}/config/admin/flags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create feature flag');
    }

    return response.json();
  },

  async updateFlag(
    key: string,
    environment: Environment,
    data: UpdateFlagData
  ): Promise<FeatureFlag> {
    const response = await fetch(
      `${API_URL}/config/admin/flags/${key}/${environment}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update feature flag');
    }

    return response.json();
  },

  async deleteFlag(key: string, environment: Environment): Promise<void> {
    const response = await fetch(
      `${API_URL}/config/admin/flags/${key}/${environment}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete feature flag');
    }
  },

  async copyFlag(
    key: string,
    fromEnvironment: Environment,
    toEnvironment: Environment
  ): Promise<FeatureFlag> {
    const response = await fetch(`${API_URL}/config/admin/flags/${key}/copy`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fromEnvironment, toEnvironment }),
    });

    if (!response.ok) {
      throw new Error('Failed to copy feature flag');
    }

    return response.json();
  },

  async clearCache(): Promise<void> {
    const response = await fetch(`${API_URL}/config/admin/flags/cache/clear`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to clear cache');
    }
  },
};

export type { FeatureFlag, UpdateFlagData, CreateFlagData };
