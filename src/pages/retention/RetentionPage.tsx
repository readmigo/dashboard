import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslate } from 'react-admin';
import { StatCard } from '../operations/components/StatCard';
import { TrendChart } from '../operations/components/TrendChart';
import { CohortHeatmap } from './components/CohortHeatmap';
import { ChannelComparison } from './components/ChannelComparison';
import { useEnvironment } from '../../contexts/EnvironmentContext';

interface RetentionOverview {
  d1RetentionRate: number;
  d7RetentionRate: number;
  d30RetentionRate: number;
  d1Change: number;
  d7Change: number;
  d30Change: number;
  totalCohortUsers: number;
  d1ActiveUsers: number;
  d7ActiveUsers: number;
  d30ActiveUsers: number;
}

interface CohortData {
  cohortDate: string;
  cohortSize: number;
  d1Rate: number | null;
  d7Rate: number | null;
  d30Rate: number | null;
  d1Retained: number | null;
  d7Retained: number | null;
  d30Retained: number | null;
}

interface ChannelRetention {
  channel: string;
  totalUsers: number;
  d1Rate: number;
  d7Rate: number;
  d30Rate: number;
  d1Retained: number;
  d7Retained: number;
  d30Retained: number;
}

interface RetentionTrend {
  date: string;
  retentionRate: number;
  cohortSize: number;
  retainedUsers: number;
  [key: string]: unknown;
}

export const RetentionPage = () => {
  const { apiBaseUrl } = useEnvironment();
  const translate = useTranslate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  const [overview, setOverview] = useState<RetentionOverview | null>(null);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [channelData, setChannelData] = useState<ChannelRetention[]>([]);
  const [trendData, setTrendData] = useState<RetentionTrend[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'d1' | 'd7' | 'd30'>('d1');

  const fetchData = async (metric: 'd1' | 'd7' | 'd30' = selectedMetric) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');

      // Debug: Log configuration
      console.log('[Retention Debug] apiBaseUrl:', apiBaseUrl);
      console.log('[Retention Debug] token exists:', !!token);
      console.log('[Retention Debug] metric:', metric);

      const headers = {
        Authorization: `Bearer ${token}`,
        'X-Admin-Mode': 'true',
      };

      const baseUrl = `${apiBaseUrl}/api/v1/admin/retention`;

      const endpoints = [
        { name: 'overview', url: `${baseUrl}/overview` },
        { name: 'cohort', url: `${baseUrl}/cohort?cohortSize=day` },
        { name: 'channel', url: `${baseUrl}/channel` },
        { name: 'trend', url: `${baseUrl}/trend?metric=${metric}` },
      ];

      console.log('[Retention Debug] Fetching endpoints:', endpoints.map(e => e.url));

      const [overviewRes, cohortRes, channelRes, trendRes] = await Promise.all([
        fetch(endpoints[0].url, { headers }),
        fetch(endpoints[1].url, { headers }),
        fetch(endpoints[2].url, { headers }),
        fetch(endpoints[3].url, { headers }),
      ]);

      // Debug: Log response status
      const responses = [
        { name: 'overview', res: overviewRes },
        { name: 'cohort', res: cohortRes },
        { name: 'channel', res: channelRes },
        { name: 'trend', res: trendRes },
      ];

      for (const { name, res } of responses) {
        console.log(`[Retention Debug] ${name}: status=${res.status}, ok=${res.ok}`);
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
        console.error('[Retention Debug] Failed responses:', errorDetails);
        throw new Error(`API errors: ${errorDetails.join('; ')}`);
      }

      const [overviewData, cohortDataRes, channelDataRes, trendDataRes] = await Promise.all([
        overviewRes.json(),
        cohortRes.json(),
        channelRes.json(),
        trendRes.json(),
      ]);

      console.log('[Retention Debug] Data fetched successfully');

      setOverview(overviewData);
      setCohortData(cohortDataRes.items || []);
      setChannelData(channelDataRes.items || []);
      setTrendData(trendDataRes.items || []);
    } catch (err) {
      console.error('[Retention Debug] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBaseUrl]);

  const handleMetricChange = (metric: 'd1' | 'd7' | 'd30') => {
    setSelectedMetric(metric);
    fetchData(metric);
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
        <Button startIcon={<RefreshIcon />} onClick={() => fetchData()}>
          {translate('buttons.retry')}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{translate('retention.title')}</Typography>
        <Button startIcon={<RefreshIcon />} onClick={() => fetchData()} variant="outlined">
          {translate('buttons.refresh')}
        </Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title={translate('retention.statCards.d1RetentionRate')}
            value={`${overview?.d1RetentionRate.toFixed(1)}%`}
            icon={<TrendingUpIcon fontSize="large" />}
            color="#7C8DF5"
            change={overview?.d1Change}
            changeLabel="vs previous period"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title={translate('retention.statCards.d7RetentionRate')}
            value={`${overview?.d7RetentionRate.toFixed(1)}%`}
            icon={<TrendingUpIcon fontSize="large" />}
            color="#9A8CF2"
            change={overview?.d7Change}
            changeLabel="vs previous period"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title={translate('retention.statCards.d30RetentionRate')}
            value={`${overview?.d30RetentionRate.toFixed(1)}%`}
            icon={<TrendingUpIcon fontSize="large" />}
            color="#6ED6A8"
            change={overview?.d30Change}
            changeLabel="vs previous period"
          />
        </Grid>
      </Grid>

      {/* Metric Selector & Trend Chart */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{translate('retention.trendTitle')}</Typography>
                <Box>
                  <Button
                    variant={selectedMetric === 'd1' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleMetricChange('d1')}
                    sx={{ mr: 1 }}
                  >
                    D1
                  </Button>
                  <Button
                    variant={selectedMetric === 'd7' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleMetricChange('d7')}
                    sx={{ mr: 1 }}
                  >
                    D7
                  </Button>
                  <Button
                    variant={selectedMetric === 'd30' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleMetricChange('d30')}
                  >
                    D30
                  </Button>
                </Box>
              </Box>
              <TrendChart
                title=""
                data={trendData}
                lines={[
                  { key: 'retentionRate', name: 'Retention Rate (%)', color: '#7C8DF5' },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for Different Views */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label={translate('retention.tabs.cohortAnalysis')} />
            <Tab label={translate('retention.tabs.channelComparison')} />
          </Tabs>
        </Box>
        <CardContent>
          {currentTab === 0 && <CohortHeatmap data={cohortData} />}
          {currentTab === 1 && <ChannelComparison data={channelData} />}
        </CardContent>
      </Card>
    </Box>
  );
};
