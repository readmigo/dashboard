export type LogLevel = 'error' | 'warn' | 'info' | 'log' | 'data' | 'debug';

export interface LogEntry {
  timestamp: string;
  type: LogLevel;
  message: string;
  data?: unknown;
}

const MAX_ENTRIES = 200;
const buffer: LogEntry[] = [];

declare global {
  interface Window {
    __DEBUG_LOGS__: LogEntry[];
    __DEBUG_LOG__: (type: LogLevel, message: string, data?: unknown) => void;
  }
}

const append = (entry: LogEntry): void => {
  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) buffer.shift();
};

const write = (type: LogLevel, message: string, data?: unknown): LogEntry => {
  const entry: LogEntry = { timestamp: new Date().toISOString(), type, message, data };
  append(entry);
  const head = `[${entry.timestamp}] [${type.toUpperCase()}] ${message}`;
  if (data !== undefined) {
    console.log(head, data);
  } else {
    console.log(head);
  }
  return entry;
};

export const logger = {
  error: (message: string, data?: unknown) => write('error', message, data),
  warn: (message: string, data?: unknown) => write('warn', message, data),
  info: (message: string, data?: unknown) => write('info', message, data),
  data: (message: string, data?: unknown) => write('data', message, data),
  debug: (message: string, data?: unknown) => write('debug', message, data),
  log: (message: string, data?: unknown) => write('log', message, data),
};

export const getLogs = (): LogEntry[] => [...buffer];
export const clearLogs = (): void => {
  buffer.length = 0;
};

// Bridge for legacy consumers reading `window.__DEBUG_LOGS__` directly
// (e.g. error report dumps in pages/tickets/TicketList.tsx).
export const installGlobalLogger = (): void => {
  if (typeof window === 'undefined') return;
  window.__DEBUG_LOGS__ = buffer;
  window.__DEBUG_LOG__ = write;
};
