import { Card, CardContent, Typography, Box, Grid, Divider } from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import LanguageIcon from '@mui/icons-material/Language';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { semanticColors } from '../../../theme/brandTokens';

interface PlatformData {
  total: number;
  ios: number;
  android: number;
  web: number;
  change?: number;
}

interface PlatformStatsSectionProps {
  title: string;
  totalUsers: PlatformData;
  dau: PlatformData;
  mau: PlatformData;
  newUsers: PlatformData;
  labels: {
    totalUsers: string;
    dau: string;
    mau: string;
    newUsers: string;
    vsYesterday: string;
  };
}

interface PlatformCardProps {
  platform: 'ios' | 'android' | 'web';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  totalUsers: number;
  dau: number;
  dauChange?: number;
  mau: number;
  newUsers: number;
  newUsersChange?: number;
  labels: {
    totalUsers: string;
    dau: string;
    mau: string;
    newUsers: string;
    vsYesterday: string;
  };
}

const PlatformCard = ({
  platform,
  icon,
  color,
  bgColor,
  totalUsers,
  dau,
  dauChange,
  mau,
  newUsers,
  newUsersChange,
  labels,
}: PlatformCardProps) => {
  const platformNames = {
    ios: 'iOS',
    android: 'Android',
    web: 'Web',
  };

  const renderChange = (change?: number) => {
    if (change === undefined) return null;
    const isPositive = change >= 0;
    return (
      <Box display="flex" alignItems="center" ml={1}>
        {isPositive ? (
          <TrendingUpIcon sx={{ fontSize: 14, color: semanticColors.success }} />
        ) : (
          <TrendingDownIcon sx={{ fontSize: 14, color: semanticColors.error }} />
        )}
        <Typography variant="caption" sx={{ color: isPositive ? semanticColors.success : semanticColors.error, ml: 0.25 }}>
          {isPositive ? '+' : ''}{change}
        </Typography>
      </Box>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              backgroundColor: bgColor,
              borderRadius: 2,
              p: 1,
              mr: 1.5,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" fontWeight="bold">
            {platformNames[platform]}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">
              {labels.totalUsers}
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {totalUsers.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">
              {labels.dau}
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h6" fontWeight="medium">
                {dau.toLocaleString()}
              </Typography>
              {renderChange(dauChange)}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">
              {labels.mau}
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {mau.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">
              {labels.newUsers}
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h6" fontWeight="medium">
                {newUsers.toLocaleString()}
              </Typography>
              {renderChange(newUsersChange)}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between">
          <Box textAlign="center" flex={1}>
            <Typography variant="caption" color="textSecondary">
              DAU/MAU
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {mau > 0 ? ((dau / mau) * 100).toFixed(1) : 0}%
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box textAlign="center" flex={1}>
            <Typography variant="caption" color="textSecondary">
              DAU/Total
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {totalUsers > 0 ? ((dau / totalUsers) * 100).toFixed(1) : 0}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const PlatformStatsSection = ({
  title,
  totalUsers,
  dau,
  mau,
  newUsers,
  labels,
}: PlatformStatsSectionProps) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <PlatformCard
            platform="ios"
            icon={<AppleIcon />}
            color="#000000"
            bgColor="#f5f5f5"
            totalUsers={totalUsers.ios}
            dau={dau.ios}
            dauChange={dau.change}
            mau={mau.ios}
            newUsers={newUsers.ios}
            newUsersChange={newUsers.change}
            labels={labels}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PlatformCard
            platform="android"
            icon={<AndroidIcon />}
            color="#3DDC84"
            bgColor="#e8f5e9"
            totalUsers={totalUsers.android}
            dau={dau.android}
            mau={mau.android}
            newUsers={newUsers.android}
            labels={labels}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PlatformCard
            platform="web"
            icon={<LanguageIcon />}
            color="#1976d2"
            bgColor="#e3f2fd"
            totalUsers={totalUsers.web}
            dau={dau.web}
            mau={mau.web}
            newUsers={newUsers.web}
            labels={labels}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
