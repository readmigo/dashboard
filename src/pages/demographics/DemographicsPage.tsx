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
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslate } from 'react-admin';
import { StatCard } from '../operations/components/StatCard';
import { GenderPieChart } from './components/GenderPieChart';
import { AgeBarChart } from './components/AgeBarChart';
import { LocationTable } from './components/LocationTable';
import { useEnvironment } from '../../contexts/EnvironmentContext';

interface DemographicsOverview {
  totalUsers: number;
  usersWithProfile: number;
  profileCompletionRate: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  preferNotToSayCount: number;
  unknownCount: number;
  averageAge: number | null;
  topCountries: string[];
}

interface GenderDistribution {
  gender: string;
  userCount: number;
  percentage: number;
  activeUsers: number;
  activityRate: number;
  avgReadingMinutes: number;
}

interface AgeDistribution {
  ageRange: string;
  userCount: number;
  percentage: number;
  activeUsers: number;
  activityRate: number;
  avgReadingMinutes: number;
}

interface LocationDistribution {
  location: string;
  userCount: number;
  percentage: number;
  activeUsers: number;
  activityRate: number;
}

export const DemographicsPage = () => {
  const { apiBaseUrl } = useEnvironment();
  const translate = useTranslate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  const [overview, setOverview] = useState<DemographicsOverview | null>(null);
  const [genderData, setGenderData] = useState<GenderDistribution[]>([]);
  const [ageData, setAgeData] = useState<AgeDistribution[]>([]);
  const [locationData, setLocationData] = useState<LocationDistribution[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');

      // Debug: Log configuration
      console.log('[Demographics Debug] apiBaseUrl:', apiBaseUrl);
      console.log('[Demographics Debug] token exists:', !!token);

      const headers = {
        Authorization: `Bearer ${token}`,
        'X-Admin-Mode': 'true',
      };

      const baseUrl = `${apiBaseUrl}/api/v1/admin/demographics`;

      const endpoints = [
        { name: 'overview', url: `${baseUrl}/overview` },
        { name: 'gender', url: `${baseUrl}/gender` },
        { name: 'age', url: `${baseUrl}/age` },
        { name: 'location', url: `${baseUrl}/location?level=country` },
      ];

      console.log('[Demographics Debug] Fetching endpoints:', endpoints.map(e => e.url));

      const [overviewRes, genderRes, ageRes, locationRes] = await Promise.all([
        fetch(endpoints[0].url, { headers }),
        fetch(endpoints[1].url, { headers }),
        fetch(endpoints[2].url, { headers }),
        fetch(endpoints[3].url, { headers }),
      ]);

      // Debug: Log response status
      const responses = [
        { name: 'overview', res: overviewRes },
        { name: 'gender', res: genderRes },
        { name: 'age', res: ageRes },
        { name: 'location', res: locationRes },
      ];

      for (const { name, res } of responses) {
        console.log(`[Demographics Debug] ${name}: status=${res.status}, ok=${res.ok}`);
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
        console.error('[Demographics Debug] Failed responses:', errorDetails);
        throw new Error(`API errors: ${errorDetails.join('; ')}`);
      }

      const [overviewData, genderDataRes, ageDataRes, locationDataRes] = await Promise.all([
        overviewRes.json(),
        genderRes.json(),
        ageRes.json(),
        locationRes.json(),
      ]);

      console.log('[Demographics Debug] Data fetched successfully');

      setOverview(overviewData);
      setGenderData(genderDataRes.items || []);
      setAgeData(ageDataRes.items || []);
      setLocationData(locationDataRes.items || []);
    } catch (err) {
      console.error('[Demographics Debug] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
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
          {translate('buttons.retry')}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{translate('demographics.title')}</Typography>
        <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="outlined">
          {translate('buttons.refresh')}
        </Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('demographics.statCards.totalUsers')}
            value={overview?.totalUsers || 0}
            icon={<PeopleIcon fontSize="large" />}
            color="#7C8DF5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('demographics.statCards.withProfileData')}
            value={overview?.usersWithProfile || 0}
            icon={<PeopleIcon fontSize="large" />}
            color="#9A8CF2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('demographics.statCards.profileCompletion')}
            value={`${overview?.profileCompletionRate || 0}%`}
            icon={<PeopleIcon fontSize="large" />}
            color="#6ED6A8"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={translate('demographics.statCards.averageAge')}
            value={overview?.averageAge ? `${overview.averageAge} years` : 'N/A'}
            icon={<PeopleIcon fontSize="large" />}
            color="#F3A6DC"
          />
        </Grid>
      </Grid>

      {/* Tabs for Different Views */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label={translate('demographics.tabs.gender')} />
            <Tab label={translate('demographics.tabs.age')} />
            <Tab label={translate('demographics.tabs.location')} />
          </Tabs>
        </Box>
        <CardContent>
          {currentTab === 0 && <GenderPieChart data={genderData} />}
          {currentTab === 1 && <AgeBarChart data={ageData} />}
          {currentTab === 2 && <LocationTable data={locationData} />}
        </CardContent>
      </Card>
    </Box>
  );
};
