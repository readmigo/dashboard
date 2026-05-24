export type TimezoneOption = {
  id: string;
  label: string;
  offset: string;
};

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { id: 'Asia/Shanghai', label: 'Beijing', offset: 'UTC+8' },
  { id: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+9' },
  { id: 'America/New_York', label: 'New York', offset: 'UTC-5' },
  { id: 'America/Los_Angeles', label: 'Los Angeles', offset: 'UTC-8' },
  { id: 'Europe/London', label: 'London', offset: 'UTC+0' },
  { id: 'UTC', label: 'UTC', offset: 'UTC+0' },
];

export const DEFAULT_TIMEZONE = 'Asia/Shanghai';

export const isValidTimezoneId = (id: string | null | undefined): id is string =>
  id != null && TIMEZONE_OPTIONS.some((tz) => tz.id === id);
