import { AuthProvider } from 'react-admin';
import { getStoredEnvironment } from '../contexts/EnvironmentContext';
import { getApiUrl } from '../config/environments';

/**
 * Get the admin API URL based on the current environment
 */
const getAdminApiUrl = (): string => {
  const env = getStoredEnvironment();
  return `${getApiUrl(env)}/api/v1/admin`;
};

// Skip authentication when disabled (works in both dev and prod)
const AUTH_DISABLED = import.meta.env.VITE_AUTH_DISABLED === 'true';

// Mock admin user for development
const MOCK_ADMIN = {
  id: 'dev-admin',
  email: 'admin@readmigo.com',
  displayName: 'Dev Admin',
  roles: ['admin'],
};

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    // In dev mode with auth disabled, auto-login
    if (AUTH_DISABLED) {
      sessionStorage.setItem('adminToken', 'dev-token');
      sessionStorage.setItem('adminUser', JSON.stringify(MOCK_ADMIN));
      return;
    }

    const response = await fetch(`${getAdminApiUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const { accessToken, user } = await response.json();
    sessionStorage.setItem('adminToken', accessToken);
    sessionStorage.setItem('adminUser', JSON.stringify(user));
  },

  logout: () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    return Promise.resolve();
  },

  checkAuth: () => {
    // In dev mode, auto-authenticate if no token
    if (AUTH_DISABLED) {
      if (!sessionStorage.getItem('adminToken')) {
        sessionStorage.setItem('adminToken', 'dev-token');
        sessionStorage.setItem('adminUser', JSON.stringify(MOCK_ADMIN));
      }
      return Promise.resolve();
    }

    const token = sessionStorage.getItem('adminToken');
    return token ? Promise.resolve() : Promise.reject();
  },

  checkError: (error) => {
    if (AUTH_DISABLED) {
      return Promise.resolve();
    }

    const status = error.status;
    if (status === 401 || status === 403) {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    // In dev mode, return mock admin
    if (AUTH_DISABLED) {
      return Promise.resolve({
        id: MOCK_ADMIN.id,
        fullName: MOCK_ADMIN.displayName,
      });
    }

    const userStr = sessionStorage.getItem('adminUser');
    if (!userStr) {
      return Promise.reject();
    }

    const user = JSON.parse(userStr);
    return Promise.resolve({
      id: user.id,
      fullName: user.displayName || user.email,
      avatar: user.avatarUrl,
    });
  },

  getPermissions: () => {
    if (AUTH_DISABLED) {
      return Promise.resolve(['admin']);
    }

    const userStr = sessionStorage.getItem('adminUser');
    if (!userStr) {
      return Promise.resolve([]);
    }

    const user = JSON.parse(userStr);
    return Promise.resolve(user.roles || ['admin']);
  },
};
