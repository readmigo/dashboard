import { useState, useEffect } from 'react';
import { useTranslate } from 'react-admin';
import { Box, Grid, Typography, CircularProgress, Alert, Button } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { brandColors, semanticColors } from '../../theme/brandTokens';
import { StatCard } from './components/StatCard';
import { PlatformBreakdown } from './components/PlatformBreakdown';
import { TrendChart } from './components/TrendChart';
import { HotContentTable } from './components/HotContentTable';
import { PlatformStatsSection } from './components/PlatformStatsSection';
import { VersionStatsSection } from './components/VersionStatsSection';
import { useEnvironment } from '../../contexts/EnvironmentContext';

interface OperationsOverview {
  date: string;
  dau: {
    total: number;
    ios: number;
    android: number;
    web: number;
    change: number;
    changePercent: number;
  };
  mau: {
    total: number;
    ios: number;
    android: number;
    web: number;
  };
  newUsers: {
    total: number;
    ios: number;
    android: number;
    web: number;
    change: number;
  };
  reading: {
    totalMinutes: number;
    totalPages: number;
    totalBooksFinished: number;
    totalSessions: number;
    avgMinutesPerUser: number;
  };
  ai: {
    totalInteractions: number;
    tokensUsed: number;
    costUsd: number;
  };
  content: {
    totalShares: number;
    totalPostcards: number;
    totalHighlights: number;
    totalAgoraPosts: number;
    wordsLearned: number;
    wordsReviewed: number;
  };
  platformUsers: {
    total: number;
    ios: number;
    android: number;
    web: number;
  };
}

interface DailyTrendItem {
  date: string;
  dauTotal: number;
  dauIos: number;
  dauAndroid: number;
  dauWeb: number;
  newUsersTotal: number;
  readingMinutes: number;
  aiInteractions: number;
  [key: string]: unknown;
}

interface HotContentItem {
  rank: number;
  contentId: string;
  type: string;
  score: number;
  viewCount: number;
  uniqueViewers: number;
  shareCount: number;
  interactionCount: number;
  title?: string;
  coverUrl?: string;
  author?: string;
}

interface VersionStatsItem {
  version: string;
  activeUsers: number;
  totalUsers: number;
  percentage: number;
  newUsersLast7Days: number;
}

interface VersionStats {
  byPlatform: {
    IOS: VersionStatsItem[];
    ANDROID: VersionStatsItem[];
    WEB: VersionStatsItem[];
  };
  overall: Array<{
    version: string;
    platform: string;
    activeUsers: number;
    totalUsers: number;
    percentage: number;
  }>;
  trend: Array<{
    date: string;
    versions: Record<string, number>;
  }>;
}

export const OperationsDashboard = () => {
  const translate = useTranslate();
  const { apiBaseUrl } = useEnvironment();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<OperationsOverview | null>(null);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendItem[]>([]);
  const [hotBooks, setHotBooks] = useState<HotContentItem[]>([]);
  const [versionStats, setVersionStats] = useState<VersionStats | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');

      // Debug: Log API configuration
      console.log('[Operations Debug] apiBaseUrl:', apiBaseUrl);
      console.log('[Operations Debug] token exists:', !!token);
      console.log('[Operations Debug] token preview:', token ? `${token.substring(0, 20)}...` : 'null');

      const headers = {
        Authorization: `Bearer ${token}`,
        'X-Admin-Mode': 'true',
      };

      const endpoints = [
        { name: 'overview', url: `${apiBaseUrl}/api/v1/admin/operations/overview` },
        { name: 'daily-trend', url: `${apiBaseUrl}/api/v1/admin/operations/daily-trend?days=7` },
        { name: 'hot-books', url: `${apiBaseUrl}/api/v1/admin/operations/hot-content/books?limit=5` },
        { name: 'version-stats', url: `${apiBaseUrl}/api/v1/admin/operations/version-stats` },
      ];

      console.log('[Operations Debug] Fetching endpoints:', endpoints.map(e => e.url));

      const [overviewRes, trendRes, hotBooksRes, versionStatsRes] = await Promise.all([
        fetch(endpoints[0].url, { headers }),
        fetch(endpoints[1].url, { headers }),
        fetch(endpoints[2].url, { headers }),
        fetch(endpoints[3].url, { headers }),
      ]);

      // Debug: Log response status for each endpoint
      const responses = [
        { name: 'overview', res: overviewRes },
        { name: 'daily-trend', res: trendRes },
        { name: 'hot-books', res: hotBooksRes },
        { name: 'version-stats', res: versionStatsRes },
      ];

      for (const { name, res } of responses) {
        console.log(`[Operations Debug] ${name}: status=${res.status}, ok=${res.ok}, statusText=${res.statusText}`);
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
            return `${name}: ${res.status} ${res.statusText} - ${body}`;
          })
        );
        console.error('[Operations Debug] Failed responses:', errorDetails);
        throw new Error(`API errors: ${errorDetails.join('; ')}`);
      }

      const [overviewData, trendData, hotBooksData, versionStatsData] = await Promise.all([
        overviewRes.json(),
        trendRes.json(),
        hotBooksRes.json(),
        versionStatsRes.json(),
      ]);

      console.log('[Operations Debug] Data fetched successfully');

      setOverview(overviewData);
      setDailyTrend(trendData);
      setHotBooks(hotBooksData.items || []);
      setVersionStats(versionStatsData);
    } catch (err) {
      console.error('[Operations Debug] Fetch error:', err);
      setError(err instanceof Error ? err.message : translate('operations.unknownError'));
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
          {translate('operations.retry')}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{translate('operations.title')}</Typography>
        <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="outlined">
          {translate('operations.refresh')}
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('operations.dauToday')}
            value={overview?.dau.total || 0}
            icon={<PeopleIcon fontSize="large" />}
            color={brandColors.primary}
            change={overview?.dau.changePercent}
            changeLabel={translate('operations.vsYesterday')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('operations.mau')}
            value={overview?.mau.total || 0}
            icon={<PeopleIcon fontSize="large" />}
            color={brandColors.accentPurple}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('operations.newUsersToday')}
            value={overview?.newUsers.total || 0}
            icon={<PersonAddIcon fontSize="large" />}
            color={semanticColors.success}
            change={overview?.newUsers.change}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('operations.aiInteractions')}
            value={overview?.ai.totalInteractions || 0}
            icon={<SmartToyIcon fontSize="large" />}
            color={brandColors.accentPink}
          />
        </Grid>
      </Grid>

      {/* Reading Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('operations.readingMinutes')}
            value={overview?.reading.totalMinutes || 0}
            icon={<MenuBookIcon fontSize="large" />}
            color={semanticColors.info}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('operations.pagesRead')}
            value={overview?.reading.totalPages || 0}
            icon={<MenuBookIcon fontSize="large" />}
            color={brandColors.accentBlue}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('operations.booksFinished')}
            value={overview?.reading.totalBooksFinished || 0}
            icon={<MenuBookIcon fontSize="large" />}
            color={brandColors.achievementGold}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('operations.avgMinutesPerUser')}
            value={overview?.reading.avgMinutesPerUser || 0}
            icon={<MenuBookIcon fontSize="large" />}
            color={semanticColors.warning}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <TrendChart
            title={translate('operations.dauTrend')}
            data={dailyTrend}
            lines={[
              { key: 'dauTotal', name: translate('operations.totalDau'), color: brandColors.primary },
              { key: 'newUsersTotal', name: translate('operations.newUsers'), color: semanticColors.success },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PlatformBreakdown
            title={translate('operations.dauByPlatform')}
            ios={overview?.dau.ios || 0}
            android={overview?.dau.android || 0}
            web={overview?.dau.web || 0}
          />
        </Grid>
      </Grid>

      {/* Platform Stats */}
      <Box mb={4}>
        <PlatformStatsSection
          title={translate('operations.platformStats')}
          totalUsers={{
            total: overview?.platformUsers.total || 0,
            ios: overview?.platformUsers.ios || 0,
            android: overview?.platformUsers.android || 0,
            web: overview?.platformUsers.web || 0,
          }}
          dau={{
            total: overview?.dau.total || 0,
            ios: overview?.dau.ios || 0,
            android: overview?.dau.android || 0,
            web: overview?.dau.web || 0,
            change: overview?.dau.change,
          }}
          mau={{
            total: overview?.mau.total || 0,
            ios: overview?.mau.ios || 0,
            android: overview?.mau.android || 0,
            web: overview?.mau.web || 0,
          }}
          newUsers={{
            total: overview?.newUsers.total || 0,
            ios: overview?.newUsers.ios || 0,
            android: overview?.newUsers.android || 0,
            web: overview?.newUsers.web || 0,
            change: overview?.newUsers.change,
          }}
          labels={{
            totalUsers: translate('operations.platform.totalUsers'),
            dau: translate('operations.platform.dau'),
            mau: translate('operations.platform.mau'),
            newUsers: translate('operations.platform.newUsers'),
            vsYesterday: translate('operations.vsYesterday'),
          }}
        />
      </Box>

      {/* Version Stats */}
      {versionStats && (
        <Box mb={4}>
          <VersionStatsSection
            title={translate('operations.versionStats.title')}
            data={versionStats}
            labels={{
              version: translate('operations.versionStats.version'),
              activeUsers: translate('operations.versionStats.activeUsers'),
              totalUsers: translate('operations.versionStats.totalUsers'),
              percentage: translate('operations.versionStats.percentage'),
              newUsers: translate('operations.versionStats.newUsers'),
              all: translate('operations.versionStats.all'),
              trend: translate('operations.versionStats.trend'),
            }}
          />
        </Box>
      )}

      {/* Hot Content */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HotContentTable title={translate('operations.hotBooksToday')} items={hotBooks} type="BOOK" />
        </Grid>
      </Grid>
    </Box>
  );
};
