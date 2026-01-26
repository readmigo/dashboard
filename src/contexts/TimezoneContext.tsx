import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type TimezoneOption = {
  id: string;
  label: string;
  offset: string;
};

// Common timezones with display labels
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { id: 'Asia/Shanghai', label: 'Beijing', offset: 'UTC+8' },
  { id: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+9' },
  { id: 'America/New_York', label: 'New York', offset: 'UTC-5' },
  { id: 'America/Los_Angeles', label: 'Los Angeles', offset: 'UTC-8' },
  { id: 'Europe/London', label: 'London', offset: 'UTC+0' },
  { id: 'UTC', label: 'UTC', offset: 'UTC+0' },
];

interface TimezoneContextType {
  timezone: string;
  setTimezone: (tz: string) => void;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  getCurrentTimezoneOption: () => TimezoneOption | undefined;
}

const TimezoneContext = createContext<TimezoneContextType | null>(null);

const STORAGE_KEY = 'dashboard_timezone';
const DEFAULT_TIMEZONE = 'Asia/Shanghai'; // Beijing as default

/**
 * Get stored timezone from localStorage
 */
export const getStoredTimezone = (): string => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && TIMEZONE_OPTIONS.some(tz => tz.id === stored)) {
    return stored;
  }
  return DEFAULT_TIMEZONE;
};

/**
 * Store timezone in localStorage
 */
const setStoredTimezone = (tz: string): void => {
  localStorage.setItem(STORAGE_KEY, tz);
};

interface TimezoneProviderProps {
  children: ReactNode;
}

export const TimezoneProvider = ({ children }: TimezoneProviderProps) => {
  const [timezone, setTimezoneState] = useState<string>(getStoredTimezone);

  const setTimezone = useCallback((tz: string) => {
    setTimezoneState(tz);
    setStoredTimezone(tz);
    // Dispatch custom event for components to react
    window.dispatchEvent(new CustomEvent('timezone-changed', { detail: { timezone: tz } }));
  }, []);

  // Format date with timezone
  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    });
  }, [timezone]);

  // Format date and time with timezone
  const formatDateTime = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [timezone]);

  // Format time only with timezone
  const formatTime = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [timezone]);

  // Get current timezone option
  const getCurrentTimezoneOption = useCallback((): TimezoneOption | undefined => {
    return TIMEZONE_OPTIONS.find(tz => tz.id === timezone);
  }, [timezone]);

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = getStoredTimezone();
    if (stored !== timezone) {
      setTimezoneState(stored);
    }
  }, []);

  return (
    <TimezoneContext.Provider
      value={{
        timezone,
        setTimezone,
        formatDate,
        formatDateTime,
        formatTime,
        getCurrentTimezoneOption,
      }}
    >
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};

export { TimezoneContext };
