import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SpeedIcon from '@mui/icons-material/Speed';
import ErrorIcon from '@mui/icons-material/Error';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslate } from 'react-admin';
import { StatCard } from './components/StatCard';
import { useEnvironment } from '../../contexts/EnvironmentContext';

interface PerformanceOverview {
  systemHealth: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    apiErrorRate: number;
    avgApiLatency: number;
    crashFreeRate: number;
  };
  clientPerformance: {
    avgPageLoadTime: number;
    avgFps: number;
    avgMemoryUsage: number;
    avgAppStartupTime: number;
  };
  apiPerformance: {
    totalRequests: number;
    errorRate: number;
    latencyP50: number;
    latencyP95: number;
    latencyP99: number;
  };
  exceptions: {
    totalExceptions: number;
    crashCount: number;
    openIssues: number;
    affectedUsers: number;
  };
}

interface ApiLatencyStats {
  endpoint: string;
  method: string;
  requestCount: number;
  errorCount: number;
  errorRate: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  latencyAvg: number;
}

interface ExceptionIssue {
  id: string;
  issueHash: string;
  exceptionType: string;
  message: string;
  platform: string;
  status: string;
  occurrenceCount: number;
  affectedUserCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

interface CriticalEndpointStats {
  endpoint: string;
  method: string;
  category: string;
  description: string;
  latencyThresholdMs: number;
  successRateTarget: number;
  requestCount: number;
  errorCount: number;
  successRate: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  latencyAvg: number;
  latencyMax: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

export const PerformanceDashboard = () => {
  const { apiBaseUrl } = useEnvironment();
  const translate = useTranslate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<PerformanceOverview | null>(null);
  const [apiStats, setApiStats] = useState<ApiLatencyStats[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionIssue[]>([]);
  const [criticalEndpoints, setCriticalEndpoints] = useState<CriticalEndpointStats[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');

      // Debug: Log configuration
      console.log('[Performance Debug] apiBaseUrl:', apiBaseUrl);
      console.log('[Performance Debug] token exists:', !!token);

      const headers = {
        Authorization: `Bearer ${token}`,
        'X-Admin-Mode': 'true',
      };

      const endpoints = [
        { name: 'overview', url: `${apiBaseUrl}/api/v1/admin/performance/overview` },
        { name: 'api-latency', url: `${apiBaseUrl}/api/v1/admin/performance/api/latency` },
        { name: 'exceptions', url: `${apiBaseUrl}/api/v1/admin/performance/exceptions?limit=10` },
        { name: 'critical-endpoints', url: `${apiBaseUrl}/api/v1/admin/performance/critical-endpoints` },
      ];

      console.log('[Performance Debug] Fetching endpoints:', endpoints.map(e => e.url));

      const [overviewRes, apiStatsRes, exceptionsRes, criticalRes] = await Promise.all([
        fetch(endpoints[0].url, { headers }),
        fetch(endpoints[1].url, { headers }),
        fetch(endpoints[2].url, { headers }),
        fetch(endpoints[3].url, { headers }),
      ]);

      // Debug: Log response status
      const responses = [
        { name: 'overview', res: overviewRes },
        { name: 'api-latency', res: apiStatsRes },
        { name: 'exceptions', res: exceptionsRes },
        { name: 'critical-endpoints', res: criticalRes },
      ];

      for (const { name, res } of responses) {
        console.log(`[Performance Debug] ${name}: status=${res.status}, ok=${res.ok}`);
      }

      // Check for failures and provide detailed error
      const failedResponses = responses.filter(r => !r.res.ok);
      if (failedResponses.length > 0) {
        const errorDetails = await Promise.all(
          failedResponses.map(async ({ name, res }) => {
            let body = '';
            try {
              body = await res.clone().text();
            } catch (e) {
              body = 'Could not read response body';
            }
            return `${name}: ${res.status} - ${body}`;
          })
        );
        console.error('[Performance Debug] Failed responses:', errorDetails);
        throw new Error(`API errors: ${errorDetails.join('; ')}`);
      }

      const [overviewData, apiStatsData, exceptionsData, criticalData] = await Promise.all([
        overviewRes.json(),
        apiStatsRes.json(),
        exceptionsRes.json(),
        criticalRes.json(),
      ]);

      console.log('[Performance Debug] Data fetched successfully');

      setOverview(overviewData);
      setApiStats(apiStatsData);
      setExceptions(exceptionsData.items || []);
      setCriticalEndpoints(criticalData.items || []);
    } catch (err) {
      console.error('[Performance Debug] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBaseUrl]);

  const getStatusChip = (status: string) => {
    const configs = {
      healthy: { color: 'success' as const, icon: <CheckCircleIcon fontSize="small" /> },
      degraded: { color: 'warning' as const, icon: <WarningIcon fontSize="small" /> },
      unhealthy: { color: 'error' as const, icon: <ErrorIcon fontSize="small" /> },
    };
    const config = configs[status as keyof typeof configs] || configs.unhealthy;
    return <Chip icon={config.icon} label={status.toUpperCase()} color={config.color} size="small" />;
  };

  const getExceptionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CRASH: '#FF6B6B',
      ANR: '#FFC26A',
      JS_ERROR: '#9A8CF2',
      NETWORK_ERROR: '#7BAAFF',
      API_ERROR: '#F3A6DC',
      OTHER: '#9E9E9E',
    };
    return colors[type] || colors.OTHER;
  };

  const getHealthStatusChip = (status: 'healthy' | 'warning' | 'critical') => {
    const configs = {
      healthy: { color: 'success' as const, label: 'Healthy' },
      warning: { color: 'warning' as const, label: 'Warning' },
      critical: { color: 'error' as const, label: 'Critical' },
    };
    const config = configs[status];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      auth: '#7C8DF5',
      user: '#9A8CF2',
      books: '#6ED6A8',
      reading: '#7BAAFF',
      ai: '#F3A6DC',
      vocabulary: '#FFD36A',
      subscriptions: '#FF6B6B',
      recommendation: '#FFC26A',
      search: '#9E9E9E',
      highlights: '#E0E0E0',
      sync: '#B0BEC5',
      tracking: '#90A4AE',
      health: '#4CAF50',
    };
    return colors[category] || '#9E9E9E';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<RefreshIcon />} onClick={fetchData}>
          {translate('buttons.retry')}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4">{translate('performance.title')}</Typography>
          {overview && getStatusChip(overview.systemHealth.status)}
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="outlined">
          {translate('buttons.refresh')}
        </Button>
      </Box>

      {/* System Health */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('performance.statCards.apiErrorRate')}
            value={`${overview?.systemHealth.apiErrorRate || 0}%`}
            icon={<ErrorIcon fontSize="large" />}
            color={overview?.systemHealth.apiErrorRate && overview.systemHealth.apiErrorRate > 1 ? '#FF6B6B' : '#6ED6A8'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('performance.statCards.avgApiLatency')}
            value={`${overview?.systemHealth.avgApiLatency || 0}ms`}
            icon={<SpeedIcon fontSize="large" />}
            color="#7C8DF5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('performance.statCards.crashFreeRate')}
            value={`${overview?.systemHealth.crashFreeRate?.toFixed(1) || 100}%`}
            icon={<CheckCircleIcon fontSize="large" />}
            color="#6ED6A8"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('performance.statCards.openIssues')}
            value={overview?.exceptions.openIssues || 0}
            icon={<BugReportIcon fontSize="large" />}
            color="#FFC26A"
          />
        </Grid>
      </Grid>

      {/* Client Performance */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        {translate('performance.clientPerformance.title')}
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('performance.clientPerformance.pageLoadTime')}
            value={`${overview?.clientPerformance.avgPageLoadTime || 0}ms`}
            icon={<SpeedIcon fontSize="large" />}
            color="#9A8CF2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('performance.clientPerformance.averageFps')}
            value={overview?.clientPerformance.avgFps || 60}
            icon={<SpeedIcon fontSize="large" />}
            color="#7BAAFF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('performance.clientPerformance.memoryUsage')}
            value={`${overview?.clientPerformance.avgMemoryUsage || 0}MB`}
            icon={<SpeedIcon fontSize="large" />}
            color="#F3A6DC"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('performance.clientPerformance.appStartupTime')}
            value={`${overview?.clientPerformance.avgAppStartupTime || 0}ms`}
            icon={<SpeedIcon fontSize="large" />}
            color="#FFD36A"
          />
        </Grid>
      </Grid>

      {/* Critical Endpoints */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Critical Endpoints Monitor" />
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Endpoint</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Requests</TableCell>
                <TableCell align="right">Success Rate</TableCell>
                <TableCell align="right">P95 Latency</TableCell>
                <TableCell align="right">Threshold</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {criticalEndpoints.map((ep, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip label={ep.method} size="small" />
                        <Typography variant="body2" fontFamily="monospace">
                          {ep.endpoint}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {ep.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ep.category}
                      size="small"
                      sx={{ backgroundColor: getCategoryColor(ep.category), color: 'white' }}
                    />
                  </TableCell>
                  <TableCell align="right">{ep.requestCount.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Typography
                      color={
                        ep.successRate < ep.successRateTarget - 1
                          ? 'error'
                          : ep.successRate < ep.successRateTarget
                            ? 'warning.main'
                            : 'success.main'
                      }
                      fontWeight="bold"
                    >
                      {ep.successRate.toFixed(2)}%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Target: {ep.successRateTarget}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={
                        ep.latencyP95 > ep.latencyThresholdMs * 2
                          ? 'error'
                          : ep.latencyP95 > ep.latencyThresholdMs * 1.5
                            ? 'warning.main'
                            : 'inherit'
                      }
                      fontWeight="bold"
                    >
                      {Math.round(ep.latencyP95)}ms
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="textSecondary">
                      {ep.latencyThresholdMs}ms
                    </Typography>
                  </TableCell>
                  <TableCell>{getHealthStatusChip(ep.healthStatus)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* API Latency Table */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title={translate('performance.apiLatency.title')} />
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{translate('performance.apiLatency.endpoint')}</TableCell>
                <TableCell>{translate('performance.apiLatency.method')}</TableCell>
                <TableCell align="right">{translate('performance.apiLatency.requests')}</TableCell>
                <TableCell align="right">{translate('performance.apiLatency.errorRate')}</TableCell>
                <TableCell align="right">P50</TableCell>
                <TableCell align="right">P95</TableCell>
                <TableCell align="right">P99</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiStats.slice(0, 10).map((stat, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {stat.endpoint}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={stat.method} size="small" />
                  </TableCell>
                  <TableCell align="right">{stat.requestCount.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Typography
                      color={stat.errorRate > 5 ? 'error' : stat.errorRate > 1 ? 'warning.main' : 'success.main'}
                    >
                      {stat.errorRate.toFixed(2)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{Math.round(stat.latencyP50)}ms</TableCell>
                  <TableCell align="right">{Math.round(stat.latencyP95)}ms</TableCell>
                  <TableCell align="right">{Math.round(stat.latencyP99)}ms</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Exceptions */}
      <Card>
        <CardHeader title={translate('performance.exceptions.title')} />
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{translate('performance.exceptions.type')}</TableCell>
                <TableCell>{translate('performance.exceptions.message')}</TableCell>
                <TableCell>{translate('performance.exceptions.platform')}</TableCell>
                <TableCell align="right">{translate('performance.exceptions.occurrences')}</TableCell>
                <TableCell align="right">{translate('performance.exceptions.affectedUsers')}</TableCell>
                <TableCell>{translate('performance.exceptions.lastSeen')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exceptions.map((exc) => (
                <TableRow key={exc.id} hover>
                  <TableCell>
                    <Chip
                      label={exc.exceptionType}
                      size="small"
                      sx={{ backgroundColor: getExceptionTypeColor(exc.exceptionType), color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {exc.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={exc.platform} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">{exc.occurrenceCount}</TableCell>
                  <TableCell align="right">{exc.affectedUserCount}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(exc.lastSeenAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};
