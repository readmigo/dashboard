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
  Tab,
  Tabs,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { brandColors, semanticColors } from '../../theme/brandTokens';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useTimezone } from '../../contexts/TimezoneContext';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface PushTemplate {
  id: string;
  name: string;
  type: string;
  titleTemplate: string;
  bodyTemplate: string;
  dataTemplate?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PushStats {
  total: number;
  byStatus: {
    SENT: number;
    FAILED: number;
    OPENED: number;
  };
  topTypes: Array<{ type: string; count: number }>;
  dailyTrend: Array<{ date: string; sent: number; failed: number; opened: number }>;
}

const STATUS_COLORS: Record<PushLogStatus, 'success' | 'error' | 'info'> = {
  SENT: 'success',
  FAILED: 'error',
  OPENED: 'info',
};

// ─── Hook: HTTP Client ────────────────────────────────────────────────────────

const useHttpClient = () => {
  const { apiBaseUrl } = useEnvironment();

  return useCallback(
    async (path: string, options: RequestInit = {}) => {
      const token = localStorage.getItem('adminToken');
      const headers = new Headers(options.headers);
      if (token) headers.set('Authorization', `Bearer ${token}`);
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

// ─── Stats Panel ──────────────────────────────────────────────────────────────

const StatsPanel = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const httpClient = useHttpClient();
  const [stats, setStats] = useState<PushStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data: PushStats = await httpClient('/api/v1/admin/notifications/stats');
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notify(`${translate('pushNotifications.stats.loadFailed')}: ${message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [httpClient, notify, translate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <Box sx={{ mb: 3 }}>
      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            title={translate('pushNotifications.stats.total')}
            value={loading ? '-' : (stats?.total ?? 0)}
            icon={<NotificationsActiveIcon fontSize="large" />}
            color={brandColors.primary}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title={translate('pushNotifications.stats.sent')}
            value={loading ? '-' : (stats?.byStatus?.SENT ?? 0)}
            icon={<SendIcon fontSize="large" />}
            color={semanticColors.success}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title={translate('pushNotifications.stats.opened')}
            value={loading ? '-' : (stats?.byStatus?.OPENED ?? 0)}
            icon={<NotificationsActiveIcon fontSize="large" />}
            color={semanticColors.info}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title={translate('pushNotifications.stats.failed')}
            value={loading ? '-' : (stats?.byStatus?.FAILED ?? 0)}
            icon={<NotificationsActiveIcon fontSize="large" />}
            color={semanticColors.error}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title={
                <Typography variant="subtitle1" fontWeight={600}>
                  {translate('pushNotifications.stats.trendTitle')}
                </Typography>
              }
              action={
                <Tooltip title={translate('common.refresh')}>
                  <span>
                    <IconButton size="small" onClick={fetchStats} disabled={loading}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats?.dailyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sent"
                      stroke={semanticColors.success}
                      name={translate('pushNotifications.status.SENT')}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="opened"
                      stroke={semanticColors.info}
                      name={translate('pushNotifications.status.OPENED')}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="failed"
                      stroke={semanticColors.error}
                      name={translate('pushNotifications.status.FAILED')}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Typography variant="subtitle1" fontWeight={600}>
                  {translate('pushNotifications.stats.topTypesTitle')}
                </Typography>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={stats?.topTypes?.slice(0, 10) || []}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="type"
                      tick={{ fontSize: 11 }}
                      width={80}
                    />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill={brandColors.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── Template Form Dialog ─────────────────────────────────────────────────────

interface TemplateFormDialogProps {
  open: boolean;
  template: PushTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}

const TemplateFormDialog = ({ open, template, onClose, onSaved }: TemplateFormDialogProps) => {
  const translate = useTranslate();
  const notify = useNotify();
  const httpClient = useHttpClient();

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [titleTemplate, setTitleTemplate] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(template?.name || '');
      setType(template?.type || '');
      setTitleTemplate(template?.titleTemplate || '');
      setBodyTemplate(template?.bodyTemplate || '');
    }
  }, [open, template]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { name, type, titleTemplate, bodyTemplate };
      if (template) {
        await httpClient(`/api/v1/admin/notifications/templates/${template.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await httpClient('/api/v1/admin/notifications/templates', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      notify(translate('pushNotifications.templates.notifications.saved'), { type: 'success' });
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notify(
        `${translate('pushNotifications.templates.notifications.saveFailed')}: ${message}`,
        { type: 'error' }
      );
    } finally {
      setSaving(false);
    }
  };

  const isValid = name.trim() && titleTemplate.trim() && bodyTemplate.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {template
          ? translate('pushNotifications.templates.editTitle')
          : translate('pushNotifications.templates.createTitle')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label={translate('pushNotifications.templates.fields.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={translate('pushNotifications.templates.fields.type')}
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="reading_reminder"
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={translate('pushNotifications.templates.fields.titleTemplate')}
              value={titleTemplate}
              onChange={(e) => setTitleTemplate(e.target.value)}
              required
              disabled={saving}
              placeholder="Hello {{username}}!"
              helperText={translate('pushNotifications.templates.variableHint')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={translate('pushNotifications.templates.fields.bodyTemplate')}
              value={bodyTemplate}
              onChange={(e) => setBodyTemplate(e.target.value)}
              required
              disabled={saving}
              placeholder="You have {{count}} books waiting..."
            />
          </Grid>
          {(titleTemplate || bodyTemplate) && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {translate('pushNotifications.templates.preview')}
                </Typography>
                <Typography variant="body2" fontWeight={600}>{titleTemplate}</Typography>
                <Typography variant="body2" color="text.secondary">{bodyTemplate}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {translate('common.cancel')}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}>
          {saving ? <CircularProgress size={18} /> : translate('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Templates Panel ──────────────────────────────────────────────────────────

const TemplatesPanel = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const httpClient = useHttpClient();
  const { formatDateTime } = useTimezone();

  const [templates, setTemplates] = useState<PushTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PushTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PushTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await httpClient('/api/v1/admin/notifications/templates');
      setTemplates(data.items || data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notify(
        `${translate('pushNotifications.templates.notifications.loadFailed')}: ${message}`,
        { type: 'error' }
      );
    } finally {
      setLoading(false);
    }
  }, [httpClient, notify, translate]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await httpClient(`/api/v1/admin/notifications/templates/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      notify(translate('pushNotifications.templates.notifications.deleted'), { type: 'success' });
      setDeleteTarget(null);
      fetchTemplates();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notify(
        `${translate('pushNotifications.templates.notifications.deleteFailed')}: ${message}`,
        { type: 'error' }
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title={
            <Typography variant="h6">
              {translate('pushNotifications.templates.title')}
            </Typography>
          }
          action={
            <Box display="flex" gap={1}>
              <Tooltip title={translate('common.refresh')}>
                <span>
                  <IconButton onClick={fetchTemplates} disabled={loading}>
                    {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => { setEditingTemplate(null); setDialogOpen(true); }}
              >
                {translate('pushNotifications.templates.create')}
              </Button>
            </Box>
          }
        />
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{translate('pushNotifications.templates.fields.name')}</TableCell>
                <TableCell>{translate('pushNotifications.templates.fields.type')}</TableCell>
                <TableCell>{translate('pushNotifications.templates.fields.titleTemplate')}</TableCell>
                <TableCell>{translate('pushNotifications.templates.fields.bodyTemplate')}</TableCell>
                <TableCell>{translate('pushNotifications.templates.fields.isActive')}</TableCell>
                <TableCell>{translate('pushNotifications.history.columns.time')}</TableCell>
                <TableCell align="right">{translate('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">{translate('common.noData')}</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading && templates.map((tpl) => (
                <TableRow key={tpl.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{tpl.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={tpl.type || '-'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 160 }}>
                    <Typography variant="body2" noWrap title={tpl.titleTemplate}>
                      {tpl.titleTemplate}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap color="text.secondary" title={tpl.bodyTemplate}>
                      {tpl.bodyTemplate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tpl.isActive
                        ? translate('pushNotifications.templates.active')
                        : translate('pushNotifications.templates.inactive')}
                      color={tpl.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(tpl.updatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={translate('common.edit')}>
                      <IconButton
                        size="small"
                        onClick={() => { setEditingTemplate(tpl); setDialogOpen(true); }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={translate('common.delete')}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(tpl)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create / Edit dialog */}
      <TemplateFormDialog
        open={dialogOpen}
        template={editingTemplate}
        onClose={() => setDialogOpen(false)}
        onSaved={() => { setDialogOpen(false); fetchTemplates(); }}
      />

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{translate('pushNotifications.templates.deleteConfirm.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translate('pushNotifications.templates.deleteConfirm.message', {
              name: deleteTarget?.name || '',
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            {translate('common.cancel')}
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={18} /> : translate('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ─── Send Form ────────────────────────────────────────────────────────────────

const SendForm = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const httpClient = useHttpClient();

  const [templates, setTemplates] = useState<PushTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [segment, setSegment] = useState<SegmentType>('premium');
  const [userIds, setUserIds] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    httpClient('/api/v1/admin/notifications/templates')
      .then((data) => setTemplates(data.items || data || []))
      .catch(() => { /* templates optional */ });
  }, [httpClient]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setTitle(tpl.titleTemplate);
      setBody(tpl.bodyTemplate);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setConfirmOpen(false);

    try {
      const payload: Record<string, unknown> = { title, body, targetType };

      if (deepLink.trim()) payload.deepLink = deepLink.trim();
      if (selectedTemplateId) payload.templateId = selectedTemplateId;

      if (targetType === 'segment') {
        payload.segment = segment;
      } else if (targetType === 'users') {
        payload.targetIds = userIds.split(',').map((id) => id.trim()).filter(Boolean);
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
      setSelectedTemplateId('');
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
  const activeTemplates = templates.filter((t) => t.isActive !== false);

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
            {/* Template selector */}
            {activeTemplates.length > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>{translate('pushNotifications.sendForm.selectTemplate')}</InputLabel>
                  <Select
                    value={selectedTemplateId}
                    label={translate('pushNotifications.sendForm.selectTemplate')}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    disabled={sending}
                  >
                    <MenuItem value="">
                      <em>{translate('pushNotifications.sendForm.noTemplate')}</em>
                    </MenuItem>
                    {activeTemplates.map((tpl) => (
                      <MenuItem key={tpl.id} value={tpl.id}>
                        {tpl.name}
                        {tpl.type && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            ({tpl.type})
                          </Typography>
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

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
                  <MenuItem value="all">{translate('pushNotifications.targetType.all')}</MenuItem>
                  <MenuItem value="segment">{translate('pushNotifications.targetType.segment')}</MenuItem>
                  <MenuItem value="users">{translate('pushNotifications.targetType.users')}</MenuItem>
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
                    <MenuItem value="premium">{translate('pushNotifications.segment.premium')}</MenuItem>
                    <MenuItem value="trial">{translate('pushNotifications.segment.trial')}</MenuItem>
                    <MenuItem value="active_7d">{translate('pushNotifications.segment.active_7d')}</MenuItem>
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
          <Button variant="contained" onClick={handleSend} disabled={sending} color="primary">
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

// ─── Push Logs Table ──────────────────────────────────────────────────────────

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
      const params = new URLSearchParams({ page: String(page + 1), limit: String(rowsPerPage) });
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
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); setTimeout(fetchLogs, 0); }}
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
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); setTimeout(fetchLogs, 0); }}
          >
            <MenuItem value="">{translate('pushNotifications.filters.allTypes')}</MenuItem>
            <MenuItem value="broadcast">{translate('pushNotifications.type.broadcast')}</MenuItem>
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
                  <Typography color="text.secondary">{translate('common.noData')}</Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && logs.map((log) => (
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
                    label={translate(`pushNotifications.status.${log.status}`, { _: log.status })}
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
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Card>
  );
};

// ─── Tab Panel ────────────────────────────────────────────────────────────────

interface TabPanelProps {
  value: number;
  index: number;
  children: React.ReactNode;
}

const TabPanel = ({ value, index, children }: TabPanelProps) => (
  <Box role="tabpanel" hidden={value !== index}>
    {value === index && <Box>{children}</Box>}
  </Box>
);

// ─── Page Root ────────────────────────────────────────────────────────────────

export const PushNotificationsPage = () => {
  const translate = useTranslate();
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          {translate('pushNotifications.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {translate('pushNotifications.subtitle')}
        </Typography>
      </Box>

      {/* Stats panel always visible at top */}
      <StatsPanel />

      <Alert severity="warning" sx={{ mb: 2 }}>
        {translate('pushNotifications.broadcastWarning')}
      </Alert>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={translate('pushNotifications.tabs.send')} />
          <Tab label={translate('pushNotifications.tabs.templates')} />
          <Tab label={translate('pushNotifications.tabs.history')} />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}>
        <SendForm />
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <TemplatesPanel />
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <PushLogsTable />
      </TabPanel>
    </Box>
  );
};
