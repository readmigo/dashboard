import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import { installGlobalLogger, logger } from './utils/logger';

installGlobalLogger();

logger.log('Application starting', {
  url: window.location.href,
  userAgent: navigator.userAgent,
  localStorage: Object.keys(localStorage),
});

window.onerror = (message, source, lineno, colno, error) => {
  logger.error(`Global error: ${message}`, { source, lineno, colno, stack: error?.stack });
  return false;
};

window.onunhandledrejection = (event) => {
  logger.error(`Unhandled promise rejection: ${event.reason}`, {
    reason: event.reason,
    stack: (event.reason as { stack?: string } | undefined)?.stack,
  });
};

const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  logger.error('Console error', args);
  originalConsoleError.apply(console, args);
};

logger.log('About to render React app');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);

logger.log('React app render called');
