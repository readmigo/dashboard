import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  Environment,
  EnvironmentConfig,
  getApiUrl,
  getEnvironmentConfig,
} from '../config/environments';
import { useAppStore } from '../stores/appStore';

export { getStoredEnvironment } from '../stores/appStore';
export type { Environment };

export interface EnvironmentHookValue {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  apiBaseUrl: string;
  config: EnvironmentConfig;
  isLoading: boolean;
}

export const useEnvironment = (): EnvironmentHookValue => {
  const { environment, setEnvironment, environmentChanging } = useAppStore(
    useShallow((s) => ({
      environment: s.environment,
      setEnvironment: s.setEnvironment,
      environmentChanging: s.environmentChanging,
    }))
  );

  return useMemo(
    () => ({
      environment,
      setEnvironment,
      apiBaseUrl: getApiUrl(environment),
      config: getEnvironmentConfig(environment),
      isLoading: environmentChanging,
    }),
    [environment, setEnvironment, environmentChanging]
  );
};
