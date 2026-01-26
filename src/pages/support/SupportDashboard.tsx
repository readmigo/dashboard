import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  Paper,
  Collapse,
  IconButton,
} from '@mui/material';
import { useDataProvider, useTranslate } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: Record<string, unknown>;
}

interface DashboardData {
  ticketStats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    todayNew: number;
    todayResolved: number;
  };
  feedbackStats: {
    total: number;
    new: number;
    avgRating: number;
    todayNew: number;
    categoryBreakdown: Record<string, number>;
  };
  orderStats: {
    totalOrders: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    pendingRefunds: number;
    refundRate: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'TICKET' | 'FEEDBACK' | 'ORDER' | 'REFUND';
    action: string;
    description: string;
    userName?: string;
    createdAt: string;
  }>;
  slaCompliance: {
    firstResponseCompliance: number;
    resolutionCompliance: number;
    breachedTickets: number;
    atRiskTickets: number;
  };
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  onClick,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  onClick?: () => void;
}) => (
  <Card
    sx={{
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? { boxShadow: 4 } : {},
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>{icon}</Avatar>
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const SLAProgress = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" fontWeight="bold">
        {value}%
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={value}
      color={color}
      sx={{ height: 8, borderRadius: 4 }}
    />
  </Box>
);

const activityTypeIcons = {
  TICKET: <ConfirmationNumberIcon />,
  FEEDBACK: <FeedbackIcon />,
  ORDER: <ReceiptIcon />,
  REFUND: <MoneyOffIcon />,
};

const activityTypeColors: Record<string, 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
  TICKET: 'primary',
  FEEDBACK: 'info',
  ORDER: 'success',
  REFUND: 'warning',
};

export const SupportDashboard = () => {
  const dataProvider = useDataProvider();
  const translate = useTranslate();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    url?: string;
    status?: number;
    statusText?: string;
    message?: string;
    body?: unknown;
    correlationId?: string;
  } | null>(null);

  const addLog = useCallback((level: LogEntry['level'], message: string, details?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    };
    setLogs((prev) => [...prev, entry]);
    console.log(`[SupportDashboard ${level.toUpperCase()}]`, message, details || '');
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setLogs([]);

    const resourceName = 'support/dashboard';
    addLog('info', 'Starting data fetch', { resource: resourceName });

    try {
      addLog('info', 'Calling dataProvider.getOne', { resource: resourceName, id: '' });
      const response = await dataProvider.getOne(resourceName, { id: '' });
      addLog('success', 'Data fetched successfully', { dataKeys: Object.keys(response.data || {}) });
      setData(response.data as DashboardData);
    } catch (err: unknown) {
      const error = err as {
        status?: number;
        statusText?: string;
        body?: { message?: string; correlationId?: string; path?: string; statusCode?: number };
        message?: string;
      };

      const errorInfo = {
        status: error.status || error.body?.statusCode,
        statusText: error.statusText,
        message: error.body?.message || error.message || 'Unknown error',
        body: error.body,
        correlationId: error.body?.correlationId,
        url: error.body?.path,
      };

      addLog('error', 'Data fetch failed', errorInfo);
      setErrorDetails(errorInfo);
      setError(translate('resources.support.errors.loadFailed'));
      setShowLogs(true);
    } finally {
      setLoading(false);
      addLog('info', 'Fetch operation completed');
    }
  }, [dataProvider, translate, addLog]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    const logLevelColors = {
      info: 'info.main',
      warn: 'warning.main',
      error: 'error.main',
      success: 'success.main',
    };

    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <IconButton color="inherit" size="small" onClick={fetchData}>
              <RefreshIcon />
            </IconButton>
          }
        >
          {error || translate('resources.support.errors.noData')}
        </Alert>

        {errorDetails && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BugReportIcon /> Error Details
            </Typography>
            <Box component="dl" sx={{ m: 0, '& dt': { fontWeight: 'bold', mt: 1 }, '& dd': { ml: 2 } }}>
              {errorDetails.status && (
                <>
                  <dt>HTTP Status:</dt>
                  <dd>{errorDetails.status} {errorDetails.statusText || ''}</dd>
                </>
              )}
              {errorDetails.message && (
                <>
                  <dt>Message:</dt>
                  <dd>{errorDetails.message}</dd>
                </>
              )}
              {errorDetails.url && (
                <>
                  <dt>Request Path:</dt>
                  <dd><code>{errorDetails.url}</code></dd>
                </>
              )}
              {errorDetails.correlationId && (
                <>
                  <dt>Correlation ID:</dt>
                  <dd><code>{errorDetails.correlationId}</code></dd>
                </>
              )}
            </Box>
          </Paper>
        )}

        <Paper sx={{ p: 2 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => setShowLogs(!showLogs)}
          >
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BugReportIcon /> Debug Logs ({logs.length})
            </Typography>
            <IconButton size="small">
              {showLogs ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={showLogs}>
            <Box
              sx={{
                mt: 2,
                maxHeight: 400,
                overflow: 'auto',
                bgcolor: 'grey.900',
                color: 'grey.100',
                borderRadius: 1,
                p: 1,
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            >
              {logs.map((log, index) => (
                <Box key={index} sx={{ mb: 1, borderBottom: '1px solid', borderColor: 'grey.700', pb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                    <Typography
                      component="span"
                      sx={{ color: 'grey.500', fontSize: 'inherit', fontFamily: 'inherit' }}
                    >
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        color: logLevelColors[log.level],
                        fontWeight: 'bold',
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                        textTransform: 'uppercase',
                      }}
                    >
                      [{log.level}]
                    </Typography>
                    <Typography component="span" sx={{ fontSize: 'inherit', fontFamily: 'inherit' }}>
                      {log.message}
                    </Typography>
                  </Box>
                  {log.details && (
                    <Box sx={{ pl: 2, color: 'grey.400', fontSize: '0.8rem' }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Collapse>
        </Paper>
      </Box>
    );
  }

  const formatCurrency = (amount: number) => {
    return `¥${(amount / 100).toLocaleString()}`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {translate('resources.support.dashboard.title')}
      </Typography>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('resources.support.dashboard.openTickets')}
            value={data.ticketStats.open}
            subtitle={translate('resources.support.dashboard.todayNew', { count: data.ticketStats.todayNew })}
            icon={<ConfirmationNumberIcon />}
            color="primary"
            onClick={() => navigate('/admin/tickets')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('resources.support.dashboard.newFeedback')}
            value={data.feedbackStats.new}
            subtitle={translate('resources.support.dashboard.avgRating', { rating: data.feedbackStats.avgRating.toFixed(1) })}
            icon={<FeedbackIcon />}
            color="info"
            onClick={() => navigate('/admin/feedback')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('resources.support.dashboard.todayRevenue')}
            value={formatCurrency(data.orderStats.todayRevenue)}
            subtitle={translate('resources.support.dashboard.ordersCount', { count: data.orderStats.todayOrders })}
            icon={<ReceiptIcon />}
            color="success"
            onClick={() => navigate('/admin/orders')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('resources.support.dashboard.pendingRefunds')}
            value={data.orderStats.pendingRefunds}
            subtitle={translate('resources.support.dashboard.refundRate', { rate: data.orderStats.refundRate })}
            icon={<MoneyOffIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Ticket Stats & SLA */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {translate('resources.support.dashboard.ticketOverview')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {data.ticketStats.open + data.ticketStats.inProgress}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {translate('resources.support.dashboard.activeTickets')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="success.main">
                      {data.ticketStats.todayResolved}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {translate('resources.support.dashboard.resolvedToday')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {translate('resources.support.dashboard.avgResponse')}
                      </Typography>
                      <Typography variant="h6">
                        {formatTime(data.ticketStats.avgResponseTime)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <CheckCircleIcon color="action" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {translate('resources.support.dashboard.avgResolution')}
                      </Typography>
                      <Typography variant="h6">
                        {formatTime(data.ticketStats.avgResolutionTime)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {translate('resources.support.dashboard.slaCompliance')}
              </Typography>
              <SLAProgress
                label={translate('resources.support.dashboard.firstResponseSLA')}
                value={data.slaCompliance.firstResponseCompliance}
                color={data.slaCompliance.firstResponseCompliance >= 90 ? 'success' : data.slaCompliance.firstResponseCompliance >= 70 ? 'warning' : 'error'}
              />
              <SLAProgress
                label={translate('resources.support.dashboard.resolutionSLA')}
                value={data.slaCompliance.resolutionCompliance}
                color={data.slaCompliance.resolutionCompliance >= 90 ? 'success' : data.slaCompliance.resolutionCompliance >= 70 ? 'warning' : 'error'}
              />
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                {data.slaCompliance.breachedTickets > 0 && (
                  <Chip
                    icon={<WarningIcon />}
                    label={translate('resources.support.dashboard.breached', { count: data.slaCompliance.breachedTickets })}
                    color="error"
                    size="small"
                  />
                )}
                {data.slaCompliance.atRiskTickets > 0 && (
                  <Chip
                    icon={<WarningIcon />}
                    label={translate('resources.support.dashboard.atRisk', { count: data.slaCompliance.atRiskTickets })}
                    color="warning"
                    size="small"
                  />
                )}
                {data.slaCompliance.breachedTickets === 0 && data.slaCompliance.atRiskTickets === 0 && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={translate('resources.support.dashboard.allOnTrack')}
                    color="success"
                    size="small"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {translate('resources.support.dashboard.recentActivity')}
              </Typography>
              <List>
                {data.recentActivity.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${activityTypeColors[activity.type]}.main` }}>
                        {activityTypeIcons[activity.type]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.description}
                      secondary={
                        <>
                          {activity.userName && `${activity.userName} • `}
                          {new Date(activity.createdAt).toLocaleString()}
                        </>
                      }
                    />
                    <Chip
                      label={activity.action}
                      size="small"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {translate('resources.support.dashboard.feedbackCategories')}
              </Typography>
              {Object.entries(data.feedbackStats.categoryBreakdown).map(([category, count]) => (
                <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{category}</Typography>
                  <Typography variant="body2" fontWeight="bold">{count}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
