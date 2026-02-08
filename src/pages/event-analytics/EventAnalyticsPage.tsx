import { useState, useEffect } from 'react';
import { useTranslate } from 'react-admin';
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
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import { StatCard } from '../operations/components/StatCard';
import { TrendChart } from '../operations/components/TrendChart';
import { useEnvironment } from '../../contexts/EnvironmentContext';

interface EventOverview {
  totalEvents: number;
  uniqueUsers: number;
  eventsByType: Array<{ type: string; count: number }>;
  topEventNames: Array<{ name: string; count: number }>;
  eventsByPlatform: Array<{ platform: string; count: number }>;
}

interface DailyTrendItem {
  date: string;
  total: number;
  reading: number;
  ai: number;
  learning: number;
  social: number;
  other: number;
  [key: string]: unknown;
}

interface ActivityOverview {
  dailyActive: Array<{ date: string; activeUsers: number }>;
  platformBreakdown: Array<{
    platform: string;
    activeUsers: number;
    totalReadingMinutes: number;
    totalAiInteractions: number;
    totalSessions: number;
  }>;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  READING: '#7C8DF5',
  AI: '#F3A6DC',
  LEARNING: '#6ED6A8',
  SOCIAL: '#FFD36A',
  NAVIGATION: '#7BAAFF',
  SUBSCRIPTION: '#A5C7FF',
  SEARCH: '#9A8CF2',
  LIFECYCLE: '#FFC26A',
  SYSTEM: '#B0BEC5',
  OTHER: '#90A4AE',
};

export const EventAnalyticsPage = () => {
  const translate = useTranslate();
  const { apiBaseUrl } = useEnvironment();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<EventOverview | null>(null);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendItem[]>([]);
  const [activity, setActivity] = useState<ActivityOverview | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'X-Admin-Mode': 'true',
      };

      const [overviewRes, trendRes, activityRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/v1/admin/operations/event-analytics/overview?days=7`, { headers }),
        fetch(`${apiBaseUrl}/api/v1/admin/operations/event-analytics/daily-trend?days=7`, { headers }),
        fetch(`${apiBaseUrl}/api/v1/admin/operations/event-analytics/activity?days=7`, { headers }),
      ]);

      const failedResponses = [
        { name: 'overview', res: overviewRes },
        { name: 'daily-trend', res: trendRes },
        { name: 'activity', res: activityRes },
      ].filter((r) => !r.res.ok);

      if (failedResponses.length > 0) {
        const errorDetails = await Promise.all(
          failedResponses.map(async ({ name, res }) => {
            let body = '';
            try {
              body = await res.clone().text();
            } catch {
              body = 'Could not read response body';
            }
            return `${name}: ${res.status} ${res.statusText} - ${body}`;
          }),
        );
        throw new Error(`API errors: ${errorDetails.join('; ')}`);
      }

      const [overviewData, trendData, activityData] = await Promise.all([
        overviewRes.json(),
        trendRes.json(),
        activityRes.json(),
      ]);

      setOverview(overviewData);
      setDailyTrend(trendData.items || []);
      setActivity(activityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('eventAnalytics.unknownError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBaseUrl]);

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
          {translate('eventAnalytics.retry')}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{translate('eventAnalytics.title')}</Typography>
        <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="outlined">
          {translate('eventAnalytics.refresh')}
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('eventAnalytics.totalEvents')}
            value={overview?.totalEvents || 0}
            icon={<EventIcon fontSize="large" />}
            color="#7C8DF5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('eventAnalytics.uniqueUsers')}
            value={overview?.uniqueUsers || 0}
            icon={<PeopleIcon fontSize="large" />}
            color="#6ED6A8"
          />
        </Grid>
      </Grid>

      {/* Daily Event Trend */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <TrendChart
            title={translate('eventAnalytics.dailyTrend')}
            data={dailyTrend}
            lines={[
              { key: 'total', name: translate('eventAnalytics.total'), color: '#7C8DF5' },
              { key: 'reading', name: translate('eventAnalytics.reading'), color: '#7BAAFF' },
              { key: 'ai', name: translate('eventAnalytics.ai'), color: '#F3A6DC' },
              { key: 'learning', name: translate('eventAnalytics.learning'), color: '#6ED6A8' },
              { key: 'social', name: translate('eventAnalytics.social'), color: '#FFD36A' },
            ]}
            height={350}
          />
        </Grid>
      </Grid>

      {/* Events by Type + Top Event Names */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={translate('eventAnalytics.eventsByType')} />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{translate('eventAnalytics.type')}</TableCell>
                      <TableCell align="right">{translate('eventAnalytics.count')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {overview?.eventsByType.map((item) => (
                      <TableRow key={item.type}>
                        <TableCell>
                          <Chip
                            label={item.type}
                            size="small"
                            sx={{
                              backgroundColor: EVENT_TYPE_COLORS[item.type] || '#90A4AE',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{item.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={translate('eventAnalytics.topEventNames')} />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>{translate('eventAnalytics.eventName')}</TableCell>
                      <TableCell align="right">{translate('eventAnalytics.count')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {overview?.topEventNames.map((item, index) => (
                      <TableRow key={item.name}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Platform Breakdown */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={translate('eventAnalytics.eventsByPlatform')} />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{translate('eventAnalytics.platform')}</TableCell>
                      <TableCell align="right">{translate('eventAnalytics.count')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {overview?.eventsByPlatform.map((item) => (
                      <TableRow key={item.platform}>
                        <TableCell>
                          <Chip label={item.platform} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">{item.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={translate('eventAnalytics.activityByPlatform')} />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{translate('eventAnalytics.platform')}</TableCell>
                      <TableCell align="right">{translate('eventAnalytics.activeUsers')}</TableCell>
                      <TableCell align="right">{translate('eventAnalytics.readingMin')}</TableCell>
                      <TableCell align="right">{translate('eventAnalytics.aiInteractions')}</TableCell>
                      <TableCell align="right">{translate('eventAnalytics.sessions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activity?.platformBreakdown.map((item) => (
                      <TableRow key={item.platform}>
                        <TableCell>
                          <Chip label={item.platform} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">{item.activeUsers.toLocaleString()}</TableCell>
                        <TableCell align="right">{item.totalReadingMinutes.toLocaleString()}</TableCell>
                        <TableCell align="right">{item.totalAiInteractions.toLocaleString()}</TableCell>
                        <TableCell align="right">{item.totalSessions.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
