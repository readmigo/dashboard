import { Card, CardHeader, CardContent, Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import WebIcon from '@mui/icons-material/Language';

const PLATFORM_COLORS = {
  iOS: '#7C8DF5',
  Android: '#6ED6A8',
  Web: '#F3A6DC',
};

interface PlatformBreakdownProps {
  title: string;
  ios: number;
  android: number;
  web: number;
}

export const PlatformBreakdown = ({ title, ios, android, web }: PlatformBreakdownProps) => {
  const total = ios + android + web;
  const data = [
    { name: 'iOS', value: ios, icon: <AppleIcon /> },
    { name: 'Android', value: android, icon: <AndroidIcon /> },
    { name: 'Web', value: web, icon: <WebIcon /> },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} />
      <CardContent>
        <Box display="flex" alignItems="center">
          <Box flex={1}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={false}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PLATFORM_COLORS[entry.name as keyof typeof PLATFORM_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ ml: 2, minWidth: 150 }}>
            {data.map((item) => (
              <Box key={item.name} display="flex" alignItems="center" mb={1.5}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: PLATFORM_COLORS[item.name as keyof typeof PLATFORM_COLORS],
                    mr: 1,
                  }}
                />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {item.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ ml: 1, minWidth: 45 }}>
                  ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
