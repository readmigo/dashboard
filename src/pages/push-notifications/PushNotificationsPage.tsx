import { useState, useCallback, useEffect } from 'react';
import { useTranslate, useNotify } from 'react-admin';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useTimezone } from '../../contexts/TimezoneContext';

type TargetType = 'all' | 'segment' | 'users';
type SegmentType = 'premium' | 'trial' | 'active_7d';
type PushLogStatus = 'SENT' | 'FAILED' | 'OPENED';

interface PushLog {
  id: string;
  title: string;
  body: string;
  type: string;
  status: PushLogStatus;
  targetDeviceToken?: string;
  userId?: string;
  createdAt: string;
  sentAt?: string;
  errorMessage?: string;
}

interface PushLogsResponse {
  items: PushLog[];
  total: number;
  page: number;
  limit: number;
}

const STATUS_COLORS: Record<PushLogStatus, 'success' | 'error' | 'info'> = {
  SENT: 'success',
  FAILED: 'error',
  OPENED: 'info',
};

const useHttpClient = () => {
  const { apiBaseUrl } = useEnvironment();

  return useCallback(
    async (path: string, options: RequestInit = {}) => {
      const token = localStorage.getItem('adminToken');
      const headers = new Headers(options.headers);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      headers.set('X-Admin-Mode', 'true');

      const res = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }
      return res.json();
    },
    [apiBaseUrl]
  );
};

const SendForm = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const httpClient = useHttpClient();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [segment, setSegment] = useState<SegmentType>('premium');
  const [userIds, setUserIds] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSend = async () => {
    setSending(true);
    setConfirmOpen(false);

    try {
      const payload: Record<string, unknown> = {
        title,
        body,
        targetType,
      };

      if (deepLink.trim()) {
        payload.deepLink = deepLink.trim();
      }

      if (targetType === 'segment') {
        payload.segment = segment;
      } else if (targetType === 'users') {
        payload.targetIds = userIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);
      }

      await httpClient('/api/v1/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      notify(translate('pushNotifications.notifications.sent'), { type: 'success' });
      setTitle('');
      setBody('');
      setDeepLink('');
      setTargetType('all');
      setSegment('premium');
      setUserIds('');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notify(`${translate('pushNotifications.notifications.sendFailed')}: ${message}`, {
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  const isValid = title.trim() && body.trim();

  return (
    <>
      <Card>
        <CardHeader
          avatar={<NotificationsActiveIcon color="primary" />}
          title={
            <Typography variant="h6">{translate('pushNotifications.sendForm.title')}</Typography>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={translate('pushNotifications.fields.title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={sending}
                inputProps={{ maxLength: 100 }}
                helperText={`${title.length}/100`}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={translate('pushNotifications.fields.body')}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                disabled={sending}
                inputProps={{ maxLength: 300 }}
                helperText={`${body.length}/300`}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={translate('pushNotifications.fields.deepLink')}
                value={deepLink}
                onChange={(e) => setDeepLink(e.target.value)}
                placeholder="readmigo://book/123"
                disabled={sending}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{translate('pushNotifications.fields.targetType')}</InputLabel>
                <Select
                  value={targetType}
                  label={translate('pushNotifications.fields.targetType')}
                  onChange={(e) => setTargetType(e.target.value as TargetType)}
                  disabled={sending}
                >
                  <MenuItem value="all">
                    {translate('pushNotifications.targetType.all')}
                  </MenuItem>
                  <MenuItem value="segment">
                    {translate('pushNotifications.targetType.segment')}
                  </MenuItem>
                  <MenuItem value="users">
                    {translate('pushNotifications.targetType.users')}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {targetType === 'segment' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{translate('pushNotifications.fields.segment')}</InputLabel>
                  <Select
                    value={segment}
                    label={translate('pushNotifications.fields.segment')}
                    onChange={(e) => setSegment(e.target.value as SegmentType)}
                    disabled={sending}
                  >
                    <MenuItem value="premium">
                      {translate('pushNotifications.segment.premium')}
                    </MenuItem>
                    <MenuItem value="trial">
                      {translate('pushNotifications.segment.trial')}
                    </MenuItem>
                    <MenuItem value="active_7d">
                      {translate('pushNotifications.segment.active_7d')}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {targetType === 'users' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={translate('pushNotifications.fields.userIds')}
                  value={userIds}
                  onChange={(e) => setUserIds(e.target.value)}
                  placeholder="user-id-1, user-id-2, user-id-3"
                  helperText={translate('pushNotifications.fields.userIdsHelper')}
                  disabled={sending}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={sending ? <CircularProgress size={18} /> : <SendIcon />}
                  onClick={() => setConfirmOpen(true)}
                  disabled={!isValid || sending}
                >
                  {translate('pushNotifications.actions.send')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{translate('pushNotifications.confirmDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translate('pushNotifications.confirmDialog.message')}
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {translate('pushNotifications.fields.title')}: {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {translate('pushNotifications.fields.body')}: {body}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {translate('pushNotifications.fields.targetType')}:{' '}
              {translate(`pushNotifications.targetType.${targetType}`)}
              {targetType === 'segment' && ` (${translate(`pushNotifications.segment.${segment}`)})`}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={sending}>
            {translate('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sending}
            color="primary"
          >
            {sending ? (
              <CircularProgress size={18} />
            ) : (
              translate('pushNotifications.confirmDialog.confirm')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const PushLogsTable = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const httpClient = useHttpClient();
  const { formatDateTime } = useTimezone();

  const [logs, setLogs] = useState<PushLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);

      const data: PushLogsResponse = await httpClient(
        `/api/v1/admin/notifications/push-logs?${params}`
      );

      setLogs(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notify(`${translate('pushNotifications.notifications.loadFailed')}: ${message}`, {
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [httpClient, notify, page, rowsPerPage, statusFilter, typeFilter, translate]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetch on mount and when filters/pagination change
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title={
          <Typography variant="h6">{translate('pushNotifications.history.title')}</Typography>
        }
        action={
          <Tooltip title={translate('common.refresh')}>
            <span>
              <IconButton onClick={fetchLogs} disabled={loading}>
                {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </span>
          </Tooltip>
        }
      />
      <Divider />

      {/* Filters */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>{translate('pushNotifications.fields.status')}</InputLabel>
          <Select
            value={statusFilter}
            label={translate('pushNotifications.fields.status')}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
              setTimeout(fetchLogs, 0);
            }}
          >
            <MenuItem value="">{translate('pushNotifications.filters.allStatuses')}</MenuItem>
            <MenuItem value="SENT">{translate('pushNotifications.status.SENT')}</MenuItem>
            <MenuItem value="FAILED">{translate('pushNotifications.status.FAILED')}</MenuItem>
            <MenuItem value="OPENED">{translate('pushNotifications.status.OPENED')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>{translate('pushNotifications.fields.type')}</InputLabel>
          <Select
            value={typeFilter}
            label={translate('pushNotifications.fields.type')}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
              setTimeout(fetchLogs, 0);
            }}
          >
            <MenuItem value="">{translate('pushNotifications.filters.allTypes')}</MenuItem>
            <MenuItem value="broadcast">
              {translate('pushNotifications.type.broadcast')}
            </MenuItem>
            <MenuItem value="direct">{translate('pushNotifications.type.direct')}</MenuItem>
          </Select>
        </FormControl>

        <Button size="small" onClick={fetchLogs} variant="outlined" disabled={loading}>
          {translate('common.filter')}
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{translate('pushNotifications.history.columns.time')}</TableCell>
              <TableCell>{translate('pushNotifications.history.columns.title')}</TableCell>
              <TableCell>{translate('pushNotifications.history.columns.body')}</TableCell>
              <TableCell>{translate('pushNotifications.history.columns.type')}</TableCell>
              <TableCell>{translate('pushNotifications.history.columns.status')}</TableCell>
              <TableCell>{translate('pushNotifications.history.columns.target')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            )}
            {!loading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {translate('common.noData')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 160 }}>
                    <Typography variant="body2" noWrap title={log.title}>
                      {log.title}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap color="text.secondary" title={log.body}>
                      {log.body}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.type || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={translate(
                        `pushNotifications.status.${log.status}`,
                        { _: log.status }
                      )}
                      color={STATUS_COLORS[log.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {log.userId || log.targetDeviceToken
                        ? (log.userId || log.targetDeviceToken || '').slice(0, 12) + '...'
                        : translate('pushNotifications.history.allUsers')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Card>
  );
};

export const PushNotificationsPage = () => {
  const translate = useTranslate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          {translate('pushNotifications.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {translate('pushNotifications.subtitle')}
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 3 }}>
        {translate('pushNotifications.broadcastWarning')}
      </Alert>

      <SendForm />
      <PushLogsTable />
    </Box>
  );
};
