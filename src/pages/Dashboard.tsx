import { Card, CardContent, Grid, Typography, Box, Chip } from '@mui/material';
import { useGetList, useTranslate } from 'react-admin';
import BookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTimezone } from '../contexts/TimezoneContext';
import { brandColors, semanticColors } from '../theme/brandTokens';
import { StatCard } from '../components/common/StatCard';

export const Dashboard = () => {
  const translate = useTranslate();
  const { getCurrentTimezoneOption } = useTimezone();
  const currentTz = getCurrentTimezoneOption();

  const { total: totalBooks, isLoading: booksLoading } = useGetList('books', {
    pagination: { page: 1, perPage: 1 },
    sort: { field: 'id', order: 'DESC' },
  });

  const { total: totalUsers, isLoading: usersLoading } = useGetList('users', {
    pagination: { page: 1, perPage: 1 },
  });

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
        <Grid item xs={12} sm={6} md={6}>
          <StatCard
            title={translate('dashboard.stats.totalBooks')}
            value={totalBooks || 0}
            icon={<BookIcon fontSize="large" />}
            color={brandColors.primary}
            loading={booksLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard
            title={translate('dashboard.stats.totalUsers')}
            value={totalUsers || 0}
            icon={<PeopleIcon fontSize="large" />}
            color={semanticColors.success}
            loading={usersLoading}
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${brandColors.primary}08 0%, ${brandColors.accentPink}08 100%)`,
            border: '1px solid',
            borderColor: `${brandColors.primary}20`,
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {translate('dashboard.moreAnalytics', { _: 'More Analytics' })}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {translate('dashboard.viewOperations', { _: 'For detailed reading statistics and performance data, please visit the' })}{' '}
              <a href="#/reading-stats" style={{ color: brandColors.primary, textDecoration: 'none', fontWeight: 500 }}>
                {translate('sidebar.operations.readingStats', { _: 'Reading Stats' })}
              </a>
              {' / '}
              <a href="#/performance" style={{ color: brandColors.primary, textDecoration: 'none', fontWeight: 500 }}>
                {translate('sidebar.operations.performance', { _: 'Performance' })}
              </a>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
