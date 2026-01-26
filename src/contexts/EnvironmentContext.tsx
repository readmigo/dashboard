import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Environment, getApiUrl, getEnvironmentConfig, EnvironmentConfig } from '../config/environments';

interface EnvironmentContextType {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  apiBaseUrl: string;
  config: EnvironmentConfig;
  isLoading: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextType | null>(null);

const STORAGE_KEY = 'dashboard_environment';

/**
 * Get stored environment from localStorage
 */
export const getStoredEnvironment = (): Environment => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'local' || stored === 'debugging' || stored === 'staging' || stored === 'production') {
    return stored;
  }
  // Default to production
  return 'production';
};

/**
 * Store environment in localStorage
 */
const setStoredEnvironment = (env: Environment): void => {
  localStorage.setItem(STORAGE_KEY, env);
};

interface EnvironmentProviderProps {
  children: ReactNode;
}

export const EnvironmentProvider = ({ children }: EnvironmentProviderProps) => {
  const [environment, setEnvironmentState] = useState<Environment>(getStoredEnvironment);
  const [isLoading, setIsLoading] = useState(false);

  const setEnvironment = useCallback((env: Environment) => {
    setIsLoading(true);
    setEnvironmentState(env);
    setStoredEnvironment(env);

    // Small delay to allow UI to update before potential API calls
    setTimeout(() => {
      setIsLoading(false);
      // Dispatch custom event for API client to react
      window.dispatchEvent(new CustomEvent('environment-changed', { detail: { environment: env } }));
    }, 100);
  }, []);

  const apiBaseUrl = getApiUrl(environment);
  const config = getEnvironmentConfig(environment);

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = getStoredEnvironment();
    if (stored !== environment) {
      setEnvironmentState(stored);
    }
  }, []);

  return (
    <EnvironmentContext.Provider
      value={{
        environment,
        setEnvironment,
        apiBaseUrl,
        config,
        isLoading,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};

export { EnvironmentContext };
export type { Environment };
