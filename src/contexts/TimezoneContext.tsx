import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { TIMEZONE_OPTIONS, TimezoneOption } from '../config/timezones';
import { useAppStore } from '../stores/appStore';

export type { TimezoneOption };

export interface TimezoneHookValue {
  timezone: string;
  setTimezone: (tz: string) => void;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  getCurrentTimezoneOption: () => TimezoneOption | undefined;
}

const toDate = (date: Date | string): Date => (typeof date === 'string' ? new Date(date) : date);

export const useTimezone = (): TimezoneHookValue => {
  const { timezone, setTimezone } = useAppStore(
    useShallow((s) => ({ timezone: s.timezone, setTimezone: s.setTimezone }))
  );

  return useMemo<TimezoneHookValue>(
    () => ({
      timezone,
      setTimezone,
      formatDate: (date, options) =>
        toDate(date).toLocaleDateString('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          ...options,
        }),
      formatDateTime: (date) =>
        toDate(date).toLocaleString('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      formatTime: (date) =>
        toDate(date).toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
        }),
      getCurrentTimezoneOption: () => TIMEZONE_OPTIONS.find((tz) => tz.id === timezone),
    }),
    [timezone, setTimezone]
  );
};
