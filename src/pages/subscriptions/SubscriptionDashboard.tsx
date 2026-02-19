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
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PercentIcon from '@mui/icons-material/Percent';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { brandColors, semanticColors } from '../../theme/brandTokens';
import { useEnvironment } from '../../contexts/EnvironmentContext';

interface SubscriptionStats {
  totalUsers: number;
  breakdown: {
    free: number;
    pro: number;
    premium: number;
    trialing: number;
    expired: number;
  };
  activeSubscribers: number;
  conversionRate: string;
}

export const SubscriptionDashboard = () => {
  const translate = useTranslate();
  const { apiBaseUrl } = useEnvironment();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'X-Admin-Mode': 'true',
      };

      const res = await fetch(
        `${apiBaseUrl}/api/v1/admin/subscriptions/stats/overview`,
        { headers },
      );

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`API error: ${res.status} ${res.statusText} - ${body}`);
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('subscriptionDashboard.unknownError'));
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
          {translate('common.refresh')}
        </Button>
      </Box>
    );
  }

  const pieData = stats
    ? [
        { name: 'Free', value: stats.breakdown.free, color: '#A1A1AA' },
        { name: 'Pro', value: stats.breakdown.pro, color: brandColors.primary },
        { name: 'Premium', value: stats.breakdown.premium, color: semanticColors.success },
        ...(stats.breakdown.trialing > 0
          ? [{ name: 'Trial', value: stats.breakdown.trialing, color: semanticColors.warning }]
          : []),
        ...(stats.breakdown.expired > 0
          ? [{ name: 'Expired', value: stats.breakdown.expired, color: semanticColors.error }]
          : []),
      ]
    : [];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{translate('subscriptionDashboard.title')}</Typography>
        <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="outlined">
          {translate('common.refresh')}
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('subscriptionDashboard.totalUsers')}
            value={stats?.totalUsers || 0}
            icon={<PeopleIcon fontSize="large" />}
            color={brandColors.primary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('subscriptionDashboard.activeSubscribers')}
            value={stats?.activeSubscribers || 0}
            icon={<CardMembershipIcon fontSize="large" />}
            color={semanticColors.success}
            subtitle={`Pro: ${stats?.breakdown.pro || 0} / Premium: ${stats?.breakdown.premium || 0}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('subscriptionDashboard.conversionRate')}
            value={stats?.conversionRate || '0%'}
            icon={<PercentIcon fontSize="large" />}
            color={brandColors.accentPurple}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('subscriptionDashboard.freeUsers')}
            value={stats?.breakdown.free || 0}
            icon={<PeopleIcon fontSize="large" />}
            color="#A1A1AA"
          />
        </Grid>
      </Grid>

      {/* Plan Distribution & Details */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={translate('subscriptionDashboard.planDistribution')} />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={translate('subscriptionDashboard.planBreakdown')} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(124, 141, 245, 0.08)',
                      border: '1px solid rgba(124, 141, 245, 0.2)',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <StarIcon sx={{ color: brandColors.primary }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Pro
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats?.breakdown.pro || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(110, 214, 168, 0.08)',
                      border: '1px solid rgba(110, 214, 168, 0.2)',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <WorkspacePremiumIcon sx={{ color: semanticColors.success }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Premium
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats?.breakdown.premium || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 194, 106, 0.08)',
                      border: '1px solid rgba(255, 194, 106, 0.2)',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TrendingUpIcon sx={{ color: semanticColors.warning }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        {translate('subscriptionDashboard.trialing')}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats?.breakdown.trialing || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 107, 107, 0.08)',
                      border: '1px solid rgba(255, 107, 107, 0.2)',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TrendingDownIcon sx={{ color: semanticColors.error }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        {translate('subscriptionDashboard.expired')}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats?.breakdown.expired || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
