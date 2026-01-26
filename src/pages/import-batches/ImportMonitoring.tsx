import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { getStoredEnvironment } from '../../contexts/EnvironmentContext';
import { getApiUrl } from '../../config/environments';

interface ImportMetrics {
  booksPerMinute: number;
  averageProcessTime: number;
  currentBatchProgress: number;
  successRate: number;
  duplicateRate: number;
  errorRate: number;
  activeBatches: number;
  pendingBatches: number;
  totalBooksToday: number;
  failedBooksToday: number;
}

interface ImportAlert {
  rule: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: string;
  metrics: Partial<ImportMetrics>;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  alerts: ImportAlert[];
  metrics: ImportMetrics;
}

interface ActivitySummary {
  date: string;
  imported: number;
  failed: number;
  skipped: number;
}

const SEVERITY_ICONS = {
  info: <InfoIcon color="info" />,
  warning: <WarningIcon color="warning" />,
  critical: <ErrorIcon color="error" />,
};

const STATUS_COLORS = {
  healthy: 'success' as const,
  degraded: 'warning' as const,
  unhealthy: 'error' as const,
};

export const ImportMonitoring = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [activity, setActivity] = useState<ActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const env = getStoredEnvironment();
      const apiUrl = getApiUrl(env);
      const token = localStorage.getItem('adminToken');

      const headers = {
        'Authorization': `Bearer ${token}`,
        'X-Admin-Mode': 'true',
      };

      const [healthRes, activityRes] = await Promise.all([
        fetch(`${apiUrl}/admin/import/monitoring/health`, { headers }),
        fetch(`${apiUrl}/admin/import/monitoring/activity?days=7`, { headers }),
      ]);

      if (healthRes.ok) {
        setHealth(await healthRes.json());
      }
      if (activityRes.ok) {
        setActivity(await activityRes.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const metrics = health?.metrics;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Import Monitoring</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Health Status */}
      <Box sx={{ mb: 3 }}>
        <Chip
          icon={health?.status === 'healthy' ? <CheckCircleIcon /> : health?.status === 'degraded' ? <WarningIcon /> : <ErrorIcon />}
          label={`System Status: ${health?.status?.toUpperCase() || 'UNKNOWN'}`}
          color={STATUS_COLORS[health?.status || 'healthy']}
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      {/* Alerts */}
      {health?.alerts && health.alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {health.alerts.map((alert, idx) => (
            <Alert
              key={idx}
              severity={alert.severity === 'critical' ? 'error' : alert.severity}
              icon={SEVERITY_ICONS[alert.severity]}
              sx={{ mb: 1 }}
            >
              <AlertTitle>{alert.rule.replace(/_/g, ' ').toUpperCase()}</AlertTitle>
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Metrics Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Books/Minute
              </Typography>
              <Typography variant="h4">
                {metrics?.booksPerMinute?.toFixed(1) || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4" color={metrics?.successRate && metrics.successRate >= 90 ? 'success.main' : 'warning.main'}>
                {metrics?.successRate?.toFixed(1) || '100'}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Error Rate
              </Typography>
              <Typography variant="h4" color={metrics?.errorRate && metrics.errorRate > 10 ? 'error.main' : 'success.main'}>
                {metrics?.errorRate?.toFixed(1) || '0'}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Batches
              </Typography>
              <Typography variant="h4">
                {metrics?.activeBatches || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today Imported
              </Typography>
              <Typography variant="h4" color="success.main">
                {metrics?.totalBooksToday || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today Failed
              </Typography>
              <Typography variant="h4" color={metrics?.failedBooksToday && metrics.failedBooksToday > 0 ? 'error.main' : 'text.primary'}>
                {metrics?.failedBooksToday || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Batches
              </Typography>
              <Typography variant="h4">
                {metrics?.pendingBatches || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Process Time
              </Typography>
              <Typography variant="h4">
                {metrics?.averageProcessTime ? `${(metrics.averageProcessTime / 1000).toFixed(1)}s` : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Batch Progress */}
      {metrics?.activeBatches && metrics.activeBatches > 0 && metrics.currentBatchProgress !== undefined && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Current Batch Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={metrics.currentBatchProgress}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2">
                {metrics.currentBatchProgress.toFixed(1)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Activity Table */}
      <Typography variant="h6" sx={{ mb: 2 }}>Last 7 Days Activity</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Imported</TableCell>
              <TableCell align="right">Failed</TableCell>
              <TableCell align="right">Skipped</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activity.map((row) => (
              <TableRow key={row.date}>
                <TableCell>{row.date}</TableCell>
                <TableCell align="right" sx={{ color: 'success.main' }}>{row.imported}</TableCell>
                <TableCell align="right" sx={{ color: row.failed > 0 ? 'error.main' : 'text.primary' }}>{row.failed}</TableCell>
                <TableCell align="right">{row.skipped}</TableCell>
                <TableCell align="right">{row.imported + row.failed + row.skipped}</TableCell>
              </TableRow>
            ))}
            {activity.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No activity in the last 7 days</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ImportMonitoring;
