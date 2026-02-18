export type Environment = 'local' | 'production';

export interface EnvironmentConfig {
  name: string;
  apiUrl: string;
  contentStudioUrl: string;
  color: 'warning' | 'info' | 'success';
  description: string;
  requireConfirmation?: boolean;
}

export const environments: Record<Environment, EnvironmentConfig> = {
  local: {
    name: 'Local',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    contentStudioUrl: import.meta.env.VITE_CONTENT_STUDIO_URL || 'http://localhost:3002',
    color: 'warning',
    description: 'Local development environment',
  },
  production: {
    name: 'Production',
    apiUrl: import.meta.env.VITE_PRODUCTION_API_URL || 'https://api.readmigo.app',
    contentStudioUrl: import.meta.env.VITE_PRODUCTION_CONTENT_STUDIO_URL || 'https://studio.readmigo.app',
    color: 'success',
    description: 'Production environment - Use with caution',
    requireConfirmation: true,
  },
};

export const getApiUrl = (env: Environment): string => {
  return environments[env].apiUrl;
};

export const getEnvironmentConfig = (env: Environment): EnvironmentConfig => {
  return environments[env];
};

// Content filter options
export type ContentFilter = 'all' | 'en' | 'zh';

export const contentFilterOptions: { value: ContentFilter; label: string }[] = [
  { value: 'all', label: 'All Languages' },
  { value: 'en', label: 'English Only' },
  { value: 'zh', label: 'Chinese Only' },
];
