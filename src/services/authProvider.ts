import type { AuthProvider } from 'react-admin';
import { getStoredEnvironment } from '../stores/appStore';
import { getApiUrl } from '../config/environments';
import { logger } from '../utils/logger';

const getAdminApiUrl = (): string => `${getApiUrl(getStoredEnvironment())}/api/v1/admin`;

const AUTH_DISABLED = import.meta.env.VITE_AUTH_DISABLED === 'true';

const MOCK_ADMIN = {
  id: 'dev-admin',
  email: 'admin@readmigo.com',
  displayName: 'Dev Admin',
  roles: ['admin'],
};

const TOKEN_KEY = 'adminToken';
const USER_KEY = 'adminUser';

const setSession = (token: string, user: typeof MOCK_ADMIN | Record<string, unknown>): void => {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = (): void => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

const ensureMockSession = (): void => {
  if (!sessionStorage.getItem(TOKEN_KEY)) {
    setSession('dev-token', MOCK_ADMIN);
  }
};

const readUser = (): { id: string; displayName?: string; email?: string; avatarUrl?: string; roles?: string[] } | null => {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    logger.warn('Failed to parse stored admin user; clearing session');
    clearSession();
    return null;
  }
};

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    if (AUTH_DISABLED) {
      setSession('dev-token', MOCK_ADMIN);
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
    setSession(accessToken, user);
  },

  logout: () => {
    clearSession();
    return Promise.resolve();
  },

  checkAuth: () => {
    if (AUTH_DISABLED) {
      ensureMockSession();
      return Promise.resolve();
    }
    return sessionStorage.getItem(TOKEN_KEY) ? Promise.resolve() : Promise.reject();
  },

  checkError: (error) => {
    if (AUTH_DISABLED) return Promise.resolve();

    const status = (error as { status?: number }).status;
    if (status === 401 || status === 403) {
      clearSession();
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    if (AUTH_DISABLED) {
      return Promise.resolve({ id: MOCK_ADMIN.id, fullName: MOCK_ADMIN.displayName });
    }

    const user = readUser();
    if (!user) return Promise.reject();

    return Promise.resolve({
      id: user.id,
      fullName: user.displayName ?? user.email,
      avatar: user.avatarUrl,
    });
  },

  getPermissions: () => {
    if (AUTH_DISABLED) return Promise.resolve(['admin']);

    const user = readUser();
    return Promise.resolve(user?.roles ?? []);
  },
};
