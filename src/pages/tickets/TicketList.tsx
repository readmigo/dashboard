import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  TextInput,
  SelectInput,
  useRecordContext,
  TopToolbar,
  FilterButton,
  ExportButton,
  BulkDeleteButton,
  useTranslate,
  useListContext,
} from 'react-admin';
import { TimezoneAwareDateField } from '../../components/TimezoneAwareDateField';
import { Chip, Box, Paper, Typography, Alert, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMemo, Component, ErrorInfo, ReactNode } from 'react';

// Debug Panel Component to show data state
const TicketDebugPanel = () => {
  const { data, total, isLoading, error } = useListContext();

  // Access global debug logs
  const debugLogs = typeof window !== 'undefined' ? window.__DEBUG_LOGS__ || [] : [];
  const ticketLogs = debugLogs.filter(log => log.message.includes('ticket'));

  return (
    <Box sx={{ mb: 2 }}>
      <Accordion defaultExpanded={!!error}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">
            Debug Info {error ? '(ERROR)' : `(${total ?? 0} records)`}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">Error:</Typography>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : JSON.stringify(error, null, 2)}
                </pre>
              </Alert>
            )}

            <Paper sx={{ p: 1, mb: 1, bgcolor: '#f5f5f5' }}>
              <Typography variant="caption" color="textSecondary">State:</Typography>
              <pre style={{ margin: 0 }}>
                {JSON.stringify({
                  isLoading,
                  hasError: !!error,
                  dataType: typeof data,
                  isArray: Array.isArray(data),
                  dataLength: Array.isArray(data) ? data.length : 'N/A',
                  total,
                }, null, 2)}
              </pre>
            </Paper>

            {Array.isArray(data) && data.length > 0 && (
              <Paper sx={{ p: 1, mb: 1, bgcolor: '#e3f2fd' }}>
                <Typography variant="caption" color="textSecondary">First Record:</Typography>
                <pre style={{ margin: 0, maxHeight: '150px', overflow: 'auto' }}>
                  {JSON.stringify(data[0], null, 2)}
                </pre>
              </Paper>
            )}

            {ticketLogs.length > 0 && (
              <Paper sx={{ p: 1, bgcolor: '#fff3e0' }}>
                <Typography variant="caption" color="textSecondary">Recent Ticket Logs ({ticketLogs.length}):</Typography>
                <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                  {ticketLogs.slice(-5).map((log, i) => (
                    <Box key={i} sx={{ borderBottom: '1px solid #eee', py: 0.5 }}>
                      <Typography variant="caption" sx={{ color: log.type === 'error' ? 'red' : 'inherit' }}>
                        [{log.type}] {log.message}
                      </Typography>
                      {log.data !== undefined && (
                        <pre style={{ margin: 0, fontSize: '10px', color: '#666' }}>
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

// Error Boundary for TicketList
interface TicketErrorBoundaryProps {
  children: ReactNode;
}

interface TicketErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class TicketErrorBoundary extends Component<TicketErrorBoundaryProps, TicketErrorBoundaryState> {
  state: TicketErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TicketList Error]', error, errorInfo);
    if (typeof window !== 'undefined' && window.__DEBUG_LOG__) {
      window.__DEBUG_LOG__('error', `[TicketList] Component error: ${error.message}`, {
        errorName: error.name,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
    this.setState({ errorInfo });
  }

  handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const debugLogs = typeof window !== 'undefined' ? window.__DEBUG_LOGS__ || [] : [];

    const report = `
=== TICKET LIST ERROR ===
Time: ${new Date().toISOString()}
URL: ${window.location.href}

Error: ${error?.name}: ${error?.message}
Stack: ${error?.stack}

Component Stack: ${errorInfo?.componentStack}

Debug Logs:
${debugLogs.slice(-20).map(l => `[${l.timestamp}] [${l.type}] ${l.message} ${l.data ? JSON.stringify(l.data) : ''}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(report).then(() => alert('Copied!'));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const debugLogs = typeof window !== 'undefined' ? window.__DEBUG_LOGS__ || [] : [];

      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">Ticket List Error</Typography>
            <Typography>{error?.name}: {error?.message}</Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <button onClick={() => window.location.reload()}>Refresh</button>
            <button onClick={this.handleCopyError}>Copy Error Report</button>
          </Box>

          <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
            <Typography variant="subtitle2" gutterBottom>Stack Trace:</Typography>
            <pre style={{ fontSize: '11px', overflow: 'auto', maxHeight: '150px' }}>
              {error?.stack}
            </pre>
          </Paper>

          {errorInfo?.componentStack && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff3e0' }}>
              <Typography variant="subtitle2" gutterBottom>Component Stack:</Typography>
              <pre style={{ fontSize: '11px', overflow: 'auto', maxHeight: '150px' }}>
                {errorInfo.componentStack}
              </pre>
            </Paper>
          )}

          <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
            <Typography variant="subtitle2" gutterBottom>Debug Logs ({debugLogs.length}):</Typography>
            <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {debugLogs.slice(-15).map((log, i) => (
                <Box key={i} sx={{ borderBottom: '1px solid #ddd', py: 0.5, fontSize: '11px' }}>
                  <span style={{ color: log.type === 'error' ? 'red' : '#666' }}>
                    [{log.timestamp}] [{log.type}] {log.message}
                  </span>
                  {log.data !== undefined && (
                    <pre style={{ margin: 0, fontSize: '10px' }}>
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  NEW: 'info',
  ASSIGNED: 'primary',
  IN_PROGRESS: 'warning',
  AWAITING_USER: 'secondary',
  RESOLVED: 'success',
  CLOSED: 'default',
  REOPENED: 'error',
};

const priorityColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  LOW: 'default',
  NORMAL: 'primary',
  HIGH: 'warning',
  URGENT: 'error',
};

const StatusField = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;
  return (
    <Chip
      label={translate(`resources.tickets.status.${record.status}`)}
      color={statusColors[record.status] || 'default'}
      size="small"
    />
  );
};

const PriorityField = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;
  return (
    <Chip
      label={translate(`resources.tickets.priority.${record.priority}`)}
      color={priorityColors[record.priority] || 'default'}
      size="small"
      variant="outlined"
    />
  );
};

const useTicketFilters = () => {
  const translate = useTranslate();
  return useMemo(() => [
    <TextInput key="search" source="search" label={translate('common.search')} alwaysOn />,
    <SelectInput
      key="status"
      source="status"
      label={translate('resources.tickets.fields.status')}
      choices={[
        { id: 'NEW', name: translate('resources.tickets.status.NEW') },
        { id: 'ASSIGNED', name: translate('resources.tickets.status.ASSIGNED') },
        { id: 'IN_PROGRESS', name: translate('resources.tickets.status.IN_PROGRESS') },
        { id: 'AWAITING_USER', name: translate('resources.tickets.status.AWAITING_USER') },
        { id: 'RESOLVED', name: translate('resources.tickets.status.RESOLVED') },
        { id: 'CLOSED', name: translate('resources.tickets.status.CLOSED') },
        { id: 'REOPENED', name: translate('resources.tickets.status.REOPENED') },
      ]}
    />,
    <SelectInput
      key="priority"
      source="priority"
      label={translate('resources.tickets.fields.priority')}
      choices={[
        { id: 'LOW', name: translate('resources.tickets.priority.LOW') },
        { id: 'NORMAL', name: translate('resources.tickets.priority.NORMAL') },
        { id: 'HIGH', name: translate('resources.tickets.priority.HIGH') },
        { id: 'URGENT', name: translate('resources.tickets.priority.URGENT') },
      ]}
    />,
    <SelectInput
      key="source"
      source="source"
      label={translate('resources.tickets.fields.source')}
      choices={[
        { id: 'APP', name: translate('resources.tickets.source.APP') },
        { id: 'WEB', name: translate('resources.tickets.source.WEB') },
        { id: 'EMAIL', name: translate('resources.tickets.source.EMAIL') },
        { id: 'FEEDBACK', name: translate('resources.tickets.source.FEEDBACK') },
        { id: 'INTERNAL', name: translate('resources.tickets.source.INTERNAL') },
      ]}
    />,
  ], [translate]);
};

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <ExportButton />
  </TopToolbar>
);

const BulkActions = () => (
  <BulkDeleteButton />
);

// Inner list content component
const TicketListContent = () => {
  const translate = useTranslate();

  return (
    <>
      <TicketDebugPanel />
      <Datagrid
        rowClick="show"
        bulkActionButtons={<BulkActions />}
      >
        <TextField source="ticketNumber" label={translate('resources.tickets.fields.ticketNumber')} />
        <TextField source="subject" label={translate('resources.tickets.fields.subject')} />
        <FunctionField
          label={translate('resources.tickets.fields.status')}
          render={() => <StatusField />}
        />
        <FunctionField
          label={translate('resources.tickets.fields.priority')}
          render={() => <PriorityField />}
        />
        <TextField source="source" label={translate('resources.tickets.fields.source')} />
        <FunctionField
          label={translate('resources.tickets.fields.user')}
          render={(record: { user?: { name?: string; email?: string } }) =>
            record?.user?.name || record?.user?.email || '-'
          }
        />
        <TextField source="messageCount" label={translate('resources.tickets.fields.messageCount')} />
        <TimezoneAwareDateField source="createdAt" label={translate('resources.tickets.fields.createdAt')} showTime />
        <TimezoneAwareDateField source="updatedAt" label={translate('resources.tickets.fields.updatedAt')} showTime />
      </Datagrid>
    </>
  );
};

export const TicketList = () => {
  const ticketFilters = useTicketFilters();

  return (
    <TicketErrorBoundary>
      <List
        filters={ticketFilters}
        actions={<ListActions />}
        sort={{ field: 'createdAt', order: 'DESC' }}
        perPage={25}
      >
        <TicketListContent />
      </List>
    </TicketErrorBoundary>
  );
};
