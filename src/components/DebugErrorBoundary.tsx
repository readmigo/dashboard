import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Paper, Button, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  debugLogs: string[];
}

// Global debug log storage
const globalDebugLogs: string[] = [];

export const debugLog = (component: string, action: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${component}] ${action}${data !== undefined ? `: ${JSON.stringify(data, null, 2)}` : ''}`;
  console.log(logEntry);
  globalDebugLogs.push(logEntry);
  // Keep only last 100 logs
  if (globalDebugLogs.length > 100) {
    globalDebugLogs.shift();
  }
};

export const clearDebugLogs = () => {
  globalDebugLogs.length = 0;
};

export const getDebugLogs = () => [...globalDebugLogs];

class DebugErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: true,
    debugLogs: [],
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      debugLogs: getDebugLogs(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DebugErrorBoundary caught error:', error, errorInfo);
    this.setState({
      errorInfo,
      debugLogs: getDebugLogs(),
    });
  }

  private handleCopyError = () => {
    const { error, errorInfo, debugLogs } = this.state;
    const { componentName } = this.props;

    const errorReport = `
=== Error Report ===
Component: ${componentName || 'Unknown'}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

=== Error ===
Name: ${error?.name}
Message: ${error?.message}

=== Stack Trace ===
${error?.stack || 'No stack trace available'}

=== Component Stack ===
${errorInfo?.componentStack || 'No component stack available'}

=== Debug Logs (last ${debugLogs.length} entries) ===
${debugLogs.join('\n')}
    `.trim();

    navigator.clipboard.writeText(errorReport).then(() => {
      alert('Error report copied to clipboard!');
    });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails, debugLogs } = this.state;
      const { componentName } = this.props;

      return (
        <Box sx={{ p: 3 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              bgcolor: '#fff3f3',
              border: '2px solid #f44336',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              ⚠️ Something went wrong
            </Typography>

            {componentName && (
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Component: {componentName}
              </Typography>
            )}

            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleRefresh}
              >
                Refresh Page
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={this.handleCopyError}
              >
                Copy Error Report
              </Button>
              <Button
                variant="text"
                endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={this.toggleDetails}
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            </Box>

            <Collapse in={showDetails}>
              <Box sx={{ mt: 2 }}>
                {/* Error Message */}
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Error Message:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      m: 0,
                    }}
                  >
                    {error?.name}: {error?.message}
                  </Typography>
                </Paper>

                {/* Stack Trace */}
                {error?.stack && (
                  <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Stack Trace:
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 200,
                        overflow: 'auto',
                        bgcolor: '#1e1e1e',
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          m: 0,
                          color: '#f8f8f8',
                          fontSize: '0.75rem',
                        }}
                      >
                        {error.stack}
                      </Typography>
                    </Box>
                  </Paper>
                )}

                {/* Component Stack */}
                {errorInfo?.componentStack && (
                  <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Component Stack:
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 150,
                        overflow: 'auto',
                        bgcolor: '#1e1e1e',
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          m: 0,
                          color: '#f8f8f8',
                          fontSize: '0.75rem',
                        }}
                      >
                        {errorInfo.componentStack}
                      </Typography>
                    </Box>
                  </Paper>
                )}

                {/* Debug Logs */}
                {debugLogs.length > 0 && (
                  <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Debug Logs ({debugLogs.length} entries):
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 300,
                        overflow: 'auto',
                        bgcolor: '#1e1e1e',
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          m: 0,
                          color: '#4fc3f7',
                          fontSize: '0.7rem',
                        }}
                      >
                        {debugLogs.join('\n')}
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Box>
            </Collapse>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default DebugErrorBoundary;
