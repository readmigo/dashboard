import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface ErrorLogEntry {
  timestamp: string;
  type: 'error' | 'log' | 'warn' | 'data';
  message: string;
  data?: unknown;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorLogs: ErrorLogEntry[];
}

// Global error log storage - accessible from anywhere
declare global {
  interface Window {
    __DEBUG_LOGS__: ErrorLogEntry[];
    __DEBUG_LOG__: (type: ErrorLogEntry['type'], message: string, data?: unknown) => void;
  }
}

// Initialize global debug logs
window.__DEBUG_LOGS__ = window.__DEBUG_LOGS__ || [];
window.__DEBUG_LOG__ = (type: ErrorLogEntry['type'], message: string, data?: unknown) => {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    data,
  };
  console.log(`[${entry.timestamp}] [${type.toUpperCase()}] ${message}`, data !== undefined ? data : '');
  window.__DEBUG_LOGS__.push(entry);
  // Keep only last 200 logs
  if (window.__DEBUG_LOGS__.length > 200) {
    window.__DEBUG_LOGS__.shift();
  }
};

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorLogs: [],
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorLogs: [...window.__DEBUG_LOGS__],
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GlobalErrorBoundary caught error:', error, errorInfo);
    window.__DEBUG_LOG__('error', `Caught by ErrorBoundary: ${error.message}`, {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    this.setState({
      errorInfo,
      errorLogs: [...window.__DEBUG_LOGS__],
    });
  }

  private handleCopyError = () => {
    const { error, errorInfo, errorLogs } = this.state;

    const errorReport = `
=== GLOBAL ERROR REPORT ===
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

=== ERROR ===
Name: ${error?.name}
Message: ${error?.message}

=== STACK TRACE ===
${error?.stack || 'No stack trace available'}

=== COMPONENT STACK ===
${errorInfo?.componentStack || 'No component stack available'}

=== DEBUG LOGS (${errorLogs.length} entries) ===
${errorLogs.map(log => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}${log.data ? '\n  Data: ' + JSON.stringify(log.data, null, 2) : ''}`).join('\n')}

=== LOCAL STORAGE ===
${Object.keys(localStorage).map(key => `${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(errorReport).then(() => {
      alert('Error report copied to clipboard!');
    });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleClearAndRefresh = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorLogs } = this.state;

      return (
        <div style={{
          padding: '20px',
          fontFamily: 'monospace',
          backgroundColor: '#1a1a2e',
          color: '#eee',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <h1 style={{ color: '#ff6b6b', marginBottom: '20px' }}>
              Application Error
            </h1>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleRefresh}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4dabf7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleCopyError}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#51cf66',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Copy Full Error Report
              </button>
              <button
                onClick={this.handleClearAndRefresh}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff8787',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Clear Storage & Refresh
              </button>
            </div>

            {/* Error Message */}
            <div style={{
              backgroundColor: '#2d2d44',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px',
              borderLeft: '4px solid #ff6b6b',
            }}>
              <h3 style={{ color: '#ff6b6b', margin: '0 0 10px 0' }}>Error Message</h3>
              <pre style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#ffa8a8',
              }}>
                {error?.name}: {error?.message}
              </pre>
            </div>

            {/* Stack Trace */}
            {error?.stack && (
              <div style={{
                backgroundColor: '#2d2d44',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
              }}>
                <h3 style={{ color: '#ffd43b', margin: '0 0 10px 0' }}>Stack Trace</h3>
                <div style={{
                  maxHeight: '200px',
                  overflow: 'auto',
                  backgroundColor: '#1a1a2e',
                  padding: '10px',
                  borderRadius: '4px',
                }}>
                  <pre style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '12px',
                    color: '#ced4da',
                  }}>
                    {error.stack}
                  </pre>
                </div>
              </div>
            )}

            {/* Component Stack */}
            {errorInfo?.componentStack && (
              <div style={{
                backgroundColor: '#2d2d44',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
              }}>
                <h3 style={{ color: '#69db7c', margin: '0 0 10px 0' }}>Component Stack</h3>
                <div style={{
                  maxHeight: '150px',
                  overflow: 'auto',
                  backgroundColor: '#1a1a2e',
                  padding: '10px',
                  borderRadius: '4px',
                }}>
                  <pre style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '12px',
                    color: '#ced4da',
                  }}>
                    {errorInfo.componentStack}
                  </pre>
                </div>
              </div>
            )}

            {/* Debug Logs */}
            <div style={{
              backgroundColor: '#2d2d44',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px',
            }}>
              <h3 style={{ color: '#74c0fc', margin: '0 0 10px 0' }}>
                Debug Logs ({errorLogs.length} entries)
              </h3>
              <div style={{
                maxHeight: '400px',
                overflow: 'auto',
                backgroundColor: '#1a1a2e',
                padding: '10px',
                borderRadius: '4px',
              }}>
                {errorLogs.length === 0 ? (
                  <p style={{ color: '#868e96', margin: 0 }}>No debug logs captured</p>
                ) : (
                  errorLogs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: '8px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #3d3d5c',
                      }}
                    >
                      <div style={{
                        color: log.type === 'error' ? '#ff8787' :
                               log.type === 'warn' ? '#ffd43b' :
                               log.type === 'data' ? '#69db7c' : '#74c0fc',
                        fontSize: '11px',
                      }}>
                        [{log.timestamp}] [{log.type.toUpperCase()}]
                      </div>
                      <div style={{ color: '#e9ecef', fontSize: '12px' }}>
                        {log.message}
                      </div>
                      {log.data !== undefined && (
                        <pre style={{
                          margin: '5px 0 0 0',
                          padding: '5px',
                          backgroundColor: '#16213e',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: '#adb5bd',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          maxHeight: '150px',
                          overflow: 'auto',
                        }}>
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
