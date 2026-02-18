import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import LanguageIcon from '@mui/icons-material/Language';
import { TrendChart } from './TrendChart';
import { brandColors, semanticColors } from '../../../theme/brandTokens';

interface VersionStatsItem {
  version: string;
  activeUsers: number;
  totalUsers: number;
  percentage: number;
  newUsersLast7Days: number;
}

interface VersionStatsSectionProps {
  title: string;
  data: {
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
  };
  labels: {
    version: string;
    activeUsers: string;
    totalUsers: string;
    percentage: string;
    newUsers: string;
    all: string;
    trend: string;
  };
}

type PlatformKey = 'all' | 'IOS' | 'ANDROID' | 'WEB';

export const VersionStatsSection = ({ title, data, labels }: VersionStatsSectionProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>('all');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: PlatformKey) => {
    setSelectedPlatform(newValue);
  };

  // Get table data based on selected platform
  const getTableData = (): VersionStatsItem[] => {
    if (selectedPlatform === 'all') {
      // Aggregate by version across all platforms
      const versionMap = new Map<string, {
        activeUsers: number;
        totalUsers: number;
        newUsersLast7Days: number;
      }>();

      data.overall.forEach(item => {
        const existing = versionMap.get(item.version);
        if (existing) {
          existing.activeUsers += item.activeUsers;
          existing.totalUsers += item.totalUsers;
        } else {
          // Find newUsersLast7Days from platform data
          let newUsers = 0;
          const platformData = data.byPlatform[item.platform as keyof typeof data.byPlatform];
          const versionItem = platformData?.find(v => v.version === item.version);
          if (versionItem) {
            newUsers = versionItem.newUsersLast7Days;
          }

          versionMap.set(item.version, {
            activeUsers: item.activeUsers,
            totalUsers: item.totalUsers,
            newUsersLast7Days: newUsers,
          });
        }
      });

      const totalUsers = Array.from(versionMap.values()).reduce(
        (sum, stats) => sum + stats.totalUsers,
        0
      );

      return Array.from(versionMap.entries())
        .map(([version, stats]) => ({
          version,
          activeUsers: stats.activeUsers,
          totalUsers: stats.totalUsers,
          percentage: totalUsers > 0 ? Number(((stats.totalUsers / totalUsers) * 100).toFixed(1)) : 0,
          newUsersLast7Days: stats.newUsersLast7Days,
        }))
        .sort((a, b) => b.totalUsers - a.totalUsers);
    } else {
      return data.byPlatform[selectedPlatform] || [];
    }
  };

  // Get trend chart data
  const getTrendChartData = () => {
    return data.trend.map(item => ({
      date: item.date,
      ...item.versions,
    }));
  };

  // Get top versions for trend lines (limit to top 5)
  const getTopVersions = (): string[] => {
    const tableData = getTableData();
    return tableData.slice(0, 5).map(v => v.version);
  };

  // Generate colors for trend lines
  const getTrendLines = () => {
    const topVersions = getTopVersions();
    const colors = [brandColors.primary, semanticColors.success, brandColors.accentPink, brandColors.achievementGold, semanticColors.info];

    return topVersions.map((version, index) => ({
      key: version,
      name: version,
      color: colors[index % colors.length],
    }));
  };

  const tableData = getTableData();

  const getPlatformIcon = (platform: PlatformKey) => {
    switch (platform) {
      case 'IOS':
        return <AppleIcon sx={{ fontSize: 18 }} />;
      case 'ANDROID':
        return <AndroidIcon sx={{ fontSize: 18 }} />;
      case 'WEB':
        return <LanguageIcon sx={{ fontSize: 18 }} />;
      default:
        return null;
    }
  };

  const getPlatformLabel = (platform: PlatformKey) => {
    switch (platform) {
      case 'IOS':
        return 'iOS';
      case 'ANDROID':
        return 'Android';
      case 'WEB':
        return 'Web';
      case 'all':
        return labels.all;
      default:
        return platform;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {title}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={selectedPlatform} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab
              value="all"
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  {getPlatformLabel('all')}
                </Box>
              }
            />
            <Tab
              value="IOS"
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  {getPlatformIcon('IOS')}
                  {getPlatformLabel('IOS')}
                </Box>
              }
            />
            <Tab
              value="ANDROID"
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  {getPlatformIcon('ANDROID')}
                  {getPlatformLabel('ANDROID')}
                </Box>
              }
            />
            <Tab
              value="WEB"
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  {getPlatformIcon('WEB')}
                  {getPlatformLabel('WEB')}
                </Box>
              }
            />
          </Tabs>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>
                    <strong>{labels.version}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{labels.activeUsers}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{labels.totalUsers}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{labels.percentage}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{labels.newUsers}</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <TableRow key={`${row.version}-${index}`} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {row.version}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{row.activeUsers.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{row.totalUsers.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Typography variant="body2">{row.percentage}%</Typography>
                          {index === 0 && <TrendingUpIcon sx={{ fontSize: 16, color: semanticColors.success, ml: 0.5 }} />}
                          {index === tableData.length - 1 && tableData.length > 1 && (
                            <TrendingDownIcon sx={{ fontSize: 16, color: semanticColors.error, ml: 0.5 }} />
                          )}
                          {index !== 0 && index !== tableData.length - 1 && tableData.length > 2 && (
                            <RemoveIcon sx={{ fontSize: 16, color: '#999', ml: 0.5 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{row.newUsersLast7Days.toLocaleString()}</Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      {data.trend.length > 0 && getTopVersions().length > 0 && (
        <TrendChart
          title={labels.trend}
          data={getTrendChartData()}
          lines={getTrendLines()}
        />
      )}
    </Box>
  );
};
