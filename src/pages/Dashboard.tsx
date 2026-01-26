import { Card, CardContent, Grid, Typography, Box, Skeleton, Chip } from '@mui/material';
import { useGetList, useTranslate } from 'react-admin';
import { useState, useEffect } from 'react';
import BookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTimezone } from '../contexts/TimezoneContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard = ({ title, value, icon, color, loading = false }: StatCardProps) => (
  <Card sx={{ minWidth: 200 }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box sx={{ flex: 1 }}>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="60%" height={48} />
          ) : (
            <Typography variant="h4">{value}</Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 1.5,
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

interface OperationsOverview {
  dau: { total: number };
}

export const Dashboard = () => {
  const translate = useTranslate();
  const { getCurrentTimezoneOption } = useTimezone();
  const [operationsData, setOperationsData] = useState<OperationsOverview | null>(null);
  const [dauLoading, setDauLoading] = useState(true);
  const currentTz = getCurrentTimezoneOption();

  const { total: totalBooks, isLoading: booksLoading } = useGetList('books', {
    pagination: { page: 1, perPage: 1 },
    sort: { field: 'id', order: 'DESC' },
  });

  const { total: totalUsers, isLoading: usersLoading } = useGetList('users', {
    pagination: { page: 1, perPage: 1 },
  });

  // Fetch operations overview data for DAU
  useEffect(() => {
    const fetchOperationsData = async () => {
      setDauLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const env = localStorage.getItem('dashboard_environment') || 'production';
        const apiUrls: Record<string, string> = {
          local: 'http://localhost:3000',
          production: 'https://api.readmigo.app',
        };
        const baseUrl = apiUrls[env] || apiUrls.production;

        const response = await fetch(`${baseUrl}/api/v1/admin/operations/overview`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOperationsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch operations data:', error);
      } finally {
        setDauLoading(false);
      }
    };

    fetchOperationsData();
  }, []);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          {translate('dashboard.title')}
        </Typography>
        <Chip
          icon={<AccessTimeIcon />}
          label={`${translate('dashboard.timezone', { _: 'Timezone' })}: ${currentTz?.label} (${currentTz?.offset})`}
          variant="outlined"
          size="small"
        />
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title={translate('dashboard.stats.totalBooks')}
            value={totalBooks || 0}
            icon={<BookIcon fontSize="large" />}
            color="#7C8DF5"
            loading={booksLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title={translate('dashboard.stats.totalUsers')}
            value={totalUsers || 0}
            icon={<PeopleIcon fontSize="large" />}
            color="#6ED6A8"
            loading={usersLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title={translate('dashboard.stats.activeToday')}
            value={operationsData?.dau?.total || 0}
            icon={<TrendingUpIcon fontSize="large" />}
            color="#F3A6DC"
            loading={dauLoading}
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {translate('dashboard.moreAnalytics', { _: 'More Analytics' })}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {translate('dashboard.viewOperations', { _: 'For detailed DAU/MAU trends, reading statistics, and hot content rankings, please visit the' })}{' '}
              <a href="#/operations" style={{ color: '#7C8DF5', textDecoration: 'none' }}>
                {translate('dashboard.operationsDashboard', { _: 'Operations Dashboard' })}
              </a>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
