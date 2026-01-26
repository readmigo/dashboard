import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// Initialize global debug logging before anything else
interface ErrorLogEntry {
  timestamp: string;
  type: 'error' | 'log' | 'warn' | 'data';
  message: string;
  data?: unknown;
}

declare global {
  interface Window {
    __DEBUG_LOGS__: ErrorLogEntry[];
    __DEBUG_LOG__: (type: ErrorLogEntry['type'], message: string, data?: unknown) => void;
  }
}

window.__DEBUG_LOGS__ = [];
window.__DEBUG_LOG__ = (type: ErrorLogEntry['type'], message: string, data?: unknown) => {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    data,
  };
  console.log(`[${entry.timestamp}] [${type.toUpperCase()}] ${message}`, data !== undefined ? data : '');
  window.__DEBUG_LOGS__.push(entry);
  if (window.__DEBUG_LOGS__.length > 200) {
    window.__DEBUG_LOGS__.shift();
  }
};

// Log app startup
window.__DEBUG_LOG__('log', 'Application starting', {
  url: window.location.href,
  userAgent: navigator.userAgent,
  localStorage: Object.keys(localStorage),
});

// Global error handlers
window.onerror = (message, source, lineno, colno, error) => {
  window.__DEBUG_LOG__('error', `Global error: ${message}`, {
    source,
    lineno,
    colno,
    stack: error?.stack,
  });
  return false; // Let the error propagate
};

window.onunhandledrejection = (event) => {
  window.__DEBUG_LOG__('error', `Unhandled promise rejection: ${event.reason}`, {
    reason: event.reason,
    stack: event.reason?.stack,
  });
};

// Override console.error to capture all errors
const originalConsoleError = console.error;
console.error = (...args) => {
  window.__DEBUG_LOG__('error', 'Console error', args);
  originalConsoleError.apply(console, args);
};

// Log before render
window.__DEBUG_LOG__('log', 'About to render React app');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);

window.__DEBUG_LOG__('log', 'React app render called');
