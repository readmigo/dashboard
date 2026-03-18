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
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslate } from 'react-admin';
import { StatCard } from '../../components/common/StatCard';
import { TrendChart } from '../../components/common/TrendChart';
import { BookRankingTable } from './components/BookRankingTable';
import { UserRankingTable } from './components/UserRankingTable';
import { CategoryChart } from './components/CategoryChart';
import { TimeHeatmap } from './components/TimeHeatmap';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useTimezone } from '../../contexts/TimezoneContext';
import { brandColors, semanticColors } from '../../theme/brandTokens';

const toMinutes = (seconds: number) => Math.round(seconds / 60);

interface ReadingStatsOverview {
  totalReadingSeconds: number;
  totalSessions: number;
  activeReaders: number;
  booksBeingRead: number;
  averageSessionDuration: number;
  averageDailySeconds: number;
}

interface BookStats {
  rank: number;
  bookId: string;
  title: string;
  author: string;
  coverUrl: string;
  totalReadingSeconds: number;
  uniqueReaders: number;
  totalSessions: number;
  averageSecondsPerReader: number;
}

interface UserStats {
  rank: number;
  userId: string;
  displayName: string;
  totalReadingSeconds: number;
  booksReadCount: number;
  totalSessions: number;
  averageSessionDuration: number;
  daysActive: number;
}

interface CategoryStats {
  categoryId: string;
  categoryName: string;
  totalReadingSeconds: number;
  percentage: number;
  uniqueReaders: number;
  booksCount: number;
  averageSecondsPerUser: number;
}

interface TimePattern {
  hour: number;
  totalSeconds: number;
  sessionsCount: number;
  uniqueUsers: number;
}

interface TrendDataPoint {
  date: string;
  totalMinutes: number;
  sessionsCount: number;
  activeUsers: number;
  averageMinutesPerUser: number;
  [key: string]: unknown;
}

export const ReadingStatsPage = () => {
  const { apiBaseUrl } = useEnvironment();
  const { timezone } = useTimezone();
  const translate = useTranslate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  const [overview, setOverview] = useState<ReadingStatsOverview | null>(null);
  const [bookStats, setBookStats] = useState<BookStats[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [timePatterns, setTimePatterns] = useState<TimePattern[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('adminToken');

      const headers = {
        Authorization: `Bearer ${token}`,
        'X-Admin-Mode': 'true',
      };

      const baseUrl = `${apiBaseUrl}/api/v1/admin/reading-stats`;

      const tzParam = encodeURIComponent(timezone);
      const endpoints = [
        { name: 'overview', url: `${baseUrl}/overview` },
        { name: 'books', url: `${baseUrl}/books?limit=20` },
        { name: 'users', url: `${baseUrl}/users?limit=20&timezone=${tzParam}` },
        { name: 'categories', url: `${baseUrl}/categories` },
        { name: 'time-patterns', url: `${baseUrl}/time-patterns?timezone=${tzParam}` },
        { name: 'trend', url: `${baseUrl}/trend?granularity=day&timezone=${tzParam}` },
      ];

      const [overviewRes, booksRes, usersRes, categoriesRes, patternsRes, trendRes] = await Promise.all([
        fetch(endpoints[0].url, { headers }),
        fetch(endpoints[1].url, { headers }),
        fetch(endpoints[2].url, { headers }),
        fetch(endpoints[3].url, { headers }),
        fetch(endpoints[4].url, { headers }),
        fetch(endpoints[5].url, { headers }),
      ]);

      const responses = [
        { name: 'overview', res: overviewRes },
        { name: 'books', res: booksRes },
        { name: 'users', res: usersRes },
        { name: 'categories', res: categoriesRes },
        { name: 'time-patterns', res: patternsRes },
        { name: 'trend', res: trendRes },
      ];

      const failedResponses = responses.filter(r => !r.res.ok);
      if (failedResponses.length > 0) {
        const errorDetails = await Promise.all(
          failedResponses.map(async ({ name, res }) => {
            let body = '';
            try {
              body = await res.clone().text();
            } catch {
              body = 'Could not read response body';
            }
            return `${name}: ${res.status} - ${body}`;
          })
        );
        throw new Error(`API errors: ${errorDetails.join('; ')}`);
      }

      const [overviewData, booksData, usersData, categoriesData, patternsData, trendDataRes] = await Promise.all([
        overviewRes.json(),
        booksRes.json(),
        usersRes.json(),
        categoriesRes.json(),
        patternsRes.json(),
        trendRes.json(),
      ]);

      setOverview(overviewData);
      setBookStats(booksData.items || []);
      setUserStats(usersData.items || []);
      setCategoryStats(categoriesData.items || []);
      setTimePatterns(patternsData.items || []);
      // Convert seconds to minutes for trend chart display
      setTrendData(
        (trendDataRes.items || []).map((item: { date: string; totalSeconds: number; sessionsCount: number; activeUsers: number; averageSecondsPerUser: number }) => ({
          date: item.date,
          totalMinutes: toMinutes(item.totalSeconds),
          sessionsCount: item.sessionsCount,
          activeUsers: item.activeUsers,
          averageMinutesPerUser: Number((item.averageSecondsPerUser / 60).toFixed(1)),
        }))
      );
    } catch (err) {
      console.error('[ReadingStats] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBaseUrl, timezone]);

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
        <Typography variant="h4">{translate('readingStats.title')}</Typography>
        <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="outlined">
          {translate('buttons.refresh')}
        </Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('readingStats.statCards.totalReadingMinutes')}
            value={toMinutes(overview?.totalReadingSeconds || 0)}
            icon={<MenuBookIcon fontSize="large" />}
            color={brandColors.primary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('readingStats.statCards.activeReaders')}
            value={overview?.activeReaders || 0}
            icon={<PeopleIcon fontSize="large" />}
            color={brandColors.accentPurple}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('readingStats.statCards.totalSessions')}
            value={overview?.totalSessions || 0}
            icon={<AccessTimeIcon fontSize="large" />}
            color={semanticColors.success}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('readingStats.statCards.avgSessionDuration')}
            value={`${toMinutes(overview?.averageSessionDuration || 0)} min`}
            icon={<MenuBookIcon fontSize="large" />}
            color={brandColors.accentPink}
          />
        </Grid>
      </Grid>

      {/* Trend Chart */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <TrendChart
            title={translate('readingStats.chartTitle')}
            data={trendData}
            lines={[
              { key: 'totalMinutes', name: translate('readingStats.statCards.totalReadingMinutes'), color: brandColors.primary },
              { key: 'activeUsers', name: translate('readingStats.statCards.activeReaders'), color: semanticColors.success },
            ]}
          />
        </Grid>
      </Grid>

      {/* Tabs for Different Views */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label={translate('readingStats.tabs.books')} />
            <Tab label={translate('readingStats.tabs.users')} />
            <Tab label={translate('readingStats.tabs.categories')} />
            <Tab label={translate('readingStats.tabs.timePatterns')} />
          </Tabs>
        </Box>
        <CardContent>
          {currentTab === 0 && <BookRankingTable books={bookStats} />}
          {currentTab === 1 && <UserRankingTable users={userStats} />}
          {currentTab === 2 && <CategoryChart categories={categoryStats} />}
          {currentTab === 3 && <TimeHeatmap patterns={timePatterns} />}
        </CardContent>
      </Card>
    </Box>
  );
};
