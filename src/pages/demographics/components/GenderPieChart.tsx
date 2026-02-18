import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, Typography, Grid } from '@mui/material';
import { brandColors, semanticColors } from '../../../theme/brandTokens';

interface GenderDistribution {
  gender: string;
  userCount: number;
  percentage: number;
  activeUsers: number;
  activityRate: number;
  avgReadingMinutes: number;
}

interface GenderPieChartProps {
  data: GenderDistribution[];
}

const COLORS: Record<string, string> = {
  MALE: brandColors.primary,
  FEMALE: brandColors.accentPink,
  OTHER: semanticColors.success,
  PREFER_NOT_TO_SAY: semanticColors.warning,
  UNKNOWN: '#E0E0E0',
};

export const GenderPieChart = ({ data }: GenderPieChartProps) => {
  const chartData = data.map((item) => ({
    name: item.gender.replace(/_/g, ' '),
    value: item.userCount,
    percentage: item.percentage,
  }));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Gender Distribution
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.percentage.toFixed(1)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[data[index].gender] || '#999'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box>
            {data.map((item) => (
              <Box
                key={item.gender}
                sx={{ mb: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: 2 }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {item.gender.replace(/_/g, ' ')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {item.userCount.toLocaleString()} users ({item.percentage.toFixed(1)}%)
                </Typography>
                <Typography variant="caption">
                  Activity Rate: {item.activityRate.toFixed(1)}% • Avg Reading: {item.avgReadingMinutes.toFixed(0)} min
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
