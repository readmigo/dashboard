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
      localStorage.setItem('adminToken', 'dev-token');
      localStorage.setItem('adminUser', JSON.stringify(MOCK_ADMIN));
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
    localStorage.setItem('adminToken', accessToken);
    localStorage.setItem('adminUser', JSON.stringify(user));
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    return Promise.resolve();
  },

  checkAuth: () => {
    // In dev mode, auto-authenticate if no token
    if (AUTH_DISABLED) {
      if (!localStorage.getItem('adminToken')) {
        localStorage.setItem('adminToken', 'dev-token');
        localStorage.setItem('adminUser', JSON.stringify(MOCK_ADMIN));
      }
      return Promise.resolve();
    }

    const token = localStorage.getItem('adminToken');
    return token ? Promise.resolve() : Promise.reject();
  },

  checkError: (error) => {
    if (AUTH_DISABLED) {
      return Promise.resolve();
    }

    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
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

    const userStr = localStorage.getItem('adminUser');
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

    const userStr = localStorage.getItem('adminUser');
    if (!userStr) {
      return Promise.resolve([]);
    }

    const user = JSON.parse(userStr);
    return Promise.resolve(user.roles || ['admin']);
  },
};
