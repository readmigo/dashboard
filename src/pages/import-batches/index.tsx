import { useState, useEffect } from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  FunctionField,
  useNotify,
  useRefresh,
  TopToolbar,
  Button,
  Show,
  SimpleShowLayout,
  useRecordContext,
  SearchInput,
  SelectInput,
  FilterButton,
  useTranslate,
} from 'react-admin';
import { TimezoneAwareDateField } from '../../components/TimezoneAwareDateField';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button as MuiButton,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { ImportMonitoring } from './ImportMonitoring';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getStoredEnvironment } from '../../contexts/EnvironmentContext';
import { getApiUrl } from '../../config/environments';

// Status colors
const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'default',
  RUNNING: 'info',
  COMPLETED: 'success',
  FAILED: 'error',
  CANCELLED: 'warning',
  ROLLED_BACK: 'default',
};

// Source label keys for translation
const SOURCE_LABEL_KEYS: Record<string, string> = {
  STANDARD_EBOOKS: 'importBatches.sources.standardEbooks',
  GUTENBERG: 'importBatches.sources.gutenberg',
  GUTENBERG_ZH: 'importBatches.sources.gutenbergZh',
  CTEXT: 'importBatches.sources.ctext',
  WIKISOURCE_ZH: 'importBatches.sources.wikisourceZh',
  SHUGE: 'importBatches.sources.shuge',
};

// Status label keys for translation
const STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING: 'importBatches.status.pending',
  RUNNING: 'importBatches.status.running',
  COMPLETED: 'importBatches.status.completed',
  FAILED: 'importBatches.status.failed',
  CANCELLED: 'importBatches.status.cancelled',
  ROLLED_BACK: 'importBatches.status.rolledBack',
};

// Hook to get translated batch statuses
const useBatchStatuses = () => {
  const translate = useTranslate();
  return [
    { id: 'PENDING', name: translate('importBatches.status.pending') },
    { id: 'RUNNING', name: translate('importBatches.status.running') },
    { id: 'COMPLETED', name: translate('importBatches.status.completed') },
    { id: 'FAILED', name: translate('importBatches.status.failed') },
    { id: 'CANCELLED', name: translate('importBatches.status.cancelled') },
    { id: 'ROLLED_BACK', name: translate('importBatches.status.rolledBack') },
  ];
};

// Hook to get translated batch sources
const useBatchSources = () => {
  const translate = useTranslate();
  return [
    { id: 'STANDARD_EBOOKS', name: translate('importBatches.sources.standardEbooks') },
    { id: 'GUTENBERG', name: translate('importBatches.sources.gutenberg') },
    { id: 'GUTENBERG_ZH', name: translate('importBatches.sources.gutenbergZh') },
    { id: 'CTEXT', name: translate('importBatches.sources.ctext') },
    { id: 'WIKISOURCE_ZH', name: translate('importBatches.sources.wikisourceZh') },
  ];
};

// Batch filters component
const BatchFilters = () => {
  const translate = useTranslate();
  const batchStatuses = useBatchStatuses();
  const batchSources = useBatchSources();

  return [
    <SearchInput source="search" alwaysOn key="search" placeholder={translate('importBatches.searchPlaceholder')} />,
    <SelectInput source="status" choices={batchStatuses} key="status" />,
    <SelectInput source="source" choices={batchSources} key="source" />,
  ];
};

// Status chip component
const StatusChip = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  const statusLabelKey = STATUS_LABEL_KEYS[record.status] || record.status;
  const statusLabel = translate(statusLabelKey);

  return (
    <Chip
      label={statusLabel}
      color={STATUS_COLORS[record.status] || 'default'}
      size="small"
    />
  );
};

// Progress bar component
const ProgressBar = () => {
  const record = useRecordContext();
  if (!record || record.totalBooks === 0) return <span>-</span>;

  const percent = Math.round((record.processedBooks / record.totalBooks) * 100);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{ width: 100, height: 8, borderRadius: 4 }}
      />
      <Typography variant="body2">{percent}%</Typography>
    </Box>
  );
};

// Stats summary component
interface BatchStats {
  totalBatches: number;
  byStatus: Record<string, number>;
  recentBatches: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  totalBooksImported: number;
  totalBooksFailed: number;
}

const BatchStatsSummary = () => {
  const [stats, setStats] = useState<BatchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const translate = useTranslate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const env = getStoredEnvironment();
        const apiUrl = getApiUrl(env);
        const token = localStorage.getItem('adminToken');

        const response = await fetch(`${apiUrl}/admin/import/batches/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Admin-Mode': 'true',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch batch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LinearProgress />;
  if (!stats) return null;

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {translate('importBatches.stats.totalBatches')}
            </Typography>
            <Typography variant="h4">{stats.totalBatches}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {translate('importBatches.stats.booksImported')}
            </Typography>
            <Typography variant="h4" color="success.main">
              {stats.totalBooksImported}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {translate('importBatches.stats.booksFailed')}
            </Typography>
            <Typography variant="h4" color="error.main">
              {stats.totalBooksFailed}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {translate('importBatches.stats.thisWeek')}
            </Typography>
            <Typography variant="h4">{stats.recentBatches.thisWeek}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Batch actions component
const BatchActions = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();
  const [confirmDialog, setConfirmDialog] = useState<'rollback' | 'cancel' | null>(null);
  const [loading, setLoading] = useState(false);

  if (!record) return null;

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      const env = getStoredEnvironment();
      const apiUrl = getApiUrl(env);
      const token = localStorage.getItem('adminToken');

      let method = 'POST';
      let endpoint = `${apiUrl}/admin/import/batches/${record.id}/${action}`;

      if (action === 'rollback') {
        method = 'DELETE';
        endpoint = `${apiUrl}/admin/import/batches/${record.id}/rollback`;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Admin-Mode': 'true',
        },
      });

      if (response.ok) {
        notify(translate('importBatches.notifications.actionSuccess', { action }), { type: 'success' });
        refresh();
      } else {
        const error = await response.json();
        notify(translate('importBatches.notifications.actionFailed', { message: error.message }), { type: 'error' });
      }
    } catch (error) {
      notify(translate('importBatches.notifications.error', { error: String(error) }), { type: 'error' });
    } finally {
      setLoading(false);
      setConfirmDialog(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {record.status === 'PENDING' && (
        <MuiButton
          size="small"
          startIcon={<CloudUploadIcon />}
          onClick={() => handleAction('start')}
          disabled={loading}
        >
          {translate('importBatches.actions.start')}
        </MuiButton>
      )}

      {record.status === 'RUNNING' && (
        <>
          <MuiButton
            size="small"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleAction('complete')}
            disabled={loading}
          >
            {translate('importBatches.actions.complete')}
          </MuiButton>
          <MuiButton
            size="small"
            color="warning"
            startIcon={<CancelIcon />}
            onClick={() => setConfirmDialog('cancel')}
            disabled={loading}
          >
            {translate('importBatches.actions.cancel')}
          </MuiButton>
        </>
      )}

      {(record.status === 'COMPLETED' || record.status === 'FAILED') && record.successBooks > 0 && (
        <MuiButton
          size="small"
          color="error"
          startIcon={<UndoIcon />}
          onClick={() => setConfirmDialog('rollback')}
          disabled={loading}
        >
          {translate('importBatches.actions.rollback')}
        </MuiButton>
      )}

      <Dialog open={confirmDialog !== null} onClose={() => setConfirmDialog(null)}>
        <DialogTitle>
          {confirmDialog === 'rollback'
            ? translate('importBatches.dialog.confirmRollback')
            : translate('importBatches.dialog.confirmCancel')
          }
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog === 'rollback'
              ? translate('importBatches.dialog.rollbackMessage', { count: record.successBooks })
              : translate('importBatches.dialog.cancelMessage')
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setConfirmDialog(null)}>
            {translate('importBatches.dialog.no')}
          </MuiButton>
          <MuiButton
            onClick={() => handleAction(confirmDialog!)}
            color={confirmDialog === 'rollback' ? 'error' : 'warning'}
            autoFocus
          >
            {confirmDialog === 'rollback'
              ? translate('importBatches.dialog.yesRollback')
              : translate('importBatches.dialog.yesCancel')
            }
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// List toolbar
const ListActions = () => {
  const refresh = useRefresh();
  const translate = useTranslate();

  return (
    <TopToolbar>
      <FilterButton />
      <Button label={translate('importBatches.actions.refresh')} onClick={() => refresh()}>
        <RefreshIcon />
      </Button>
    </TopToolbar>
  );
};

// Batch list content component
const BatchListContent = () => {
  const translate = useTranslate();
  const batchFilters = BatchFilters();

  return (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        {translate('importBatches.alertMessage')}
      </Alert>
      <BatchStatsSummary />
      <List
        resource="import/batches"
        filters={batchFilters}
        actions={<ListActions />}
        sort={{ field: 'startedAt', order: 'DESC' }}
        perPage={20}
      >
        <Datagrid bulkActionButtons={false}>
          <TextField source="id" label={translate('importBatches.columns.batchId')} />
          <FunctionField
            source="source"
            label={translate('importBatches.columns.source')}
            render={(record: { source: string }) => {
              const labelKey = SOURCE_LABEL_KEYS[record.source];
              return labelKey ? translate(labelKey) : record.source;
            }}
          />
          <TextField source="environment" label={translate('importBatches.columns.environment')} />
          <StatusChip />
          <NumberField source="totalBooks" label={translate('importBatches.columns.total')} />
          <ProgressBar />
          <NumberField source="successBooks" label={translate('importBatches.columns.success')} />
          <NumberField source="failedBooks" label={translate('importBatches.columns.failed')} />
          <NumberField source="skippedBooks" label={translate('importBatches.columns.skipped')} />
          <TimezoneAwareDateField source="startedAt" label={translate('importBatches.columns.started')} showTime />
          <TimezoneAwareDateField source="completedAt" label={translate('importBatches.columns.completed')} showTime />
          <BatchActions />
        </Datagrid>
      </List>
    </>
  );
};

// Main list component with tabs
export const ImportBatchList = () => {
  const [tabValue, setTabValue] = useState(0);
  const translate = useTranslate();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>{translate('importBatches.title')}</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<ListAltIcon />} iconPosition="start" label={translate('importBatches.tabs.batches')} />
          <Tab icon={<MonitorHeartIcon />} iconPosition="start" label={translate('importBatches.tabs.monitoring')} />
        </Tabs>
      </Box>
      {tabValue === 0 && <BatchListContent />}
      {tabValue === 1 && <ImportMonitoring />}
    </Box>
  );
};

// Show component for batch details
export const ImportBatchShow = () => {
  const translate = useTranslate();

  return (
    <Show resource="import/batches">
      <SimpleShowLayout>
        <TextField source="id" label={translate('importBatches.columns.batchId')} />
        <TextField source="source" label={translate('importBatches.columns.source')} />
        <TextField source="environment" label={translate('importBatches.columns.environment')} />
        <TextField source="status" label={translate('importBatches.columns.status')} />
        <NumberField source="totalBooks" label={translate('importBatches.columns.totalBooks')} />
        <NumberField source="processedBooks" label={translate('importBatches.columns.processed')} />
        <NumberField source="successBooks" label={translate('importBatches.columns.success')} />
        <NumberField source="failedBooks" label={translate('importBatches.columns.failed')} />
        <NumberField source="skippedBooks" label={translate('importBatches.columns.skipped')} />
        <TimezoneAwareDateField source="startedAt" label={translate('importBatches.columns.startedAt')} showTime />
        <TimezoneAwareDateField source="completedAt" label={translate('importBatches.columns.completedAt')} showTime />
        <TextField source="createdBy" label={translate('importBatches.columns.createdBy')} />
        <TextField source="notes" label={translate('importBatches.columns.notes')} />
      </SimpleShowLayout>
    </Show>
  );
};

export default ImportBatchList;
