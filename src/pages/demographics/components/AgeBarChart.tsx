import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Box, Typography } from '@mui/material';
import { brandColors, semanticColors } from '../../../theme/brandTokens';

interface AgeDistribution {
  ageRange: string;
  userCount: number;
  percentage: number;
  activeUsers: number;
  activityRate: number;
  avgReadingMinutes: number;
}

interface AgeBarChartProps {
  data: AgeDistribution[];
}

export const AgeBarChart = ({ data }: AgeBarChartProps) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Age Distribution
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="ageRange" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} label={{ value: 'User Count', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend />
          <Bar dataKey="userCount" name="Total Users" fill={brandColors.primary} />
          <Bar dataKey="activeUsers" name="Active Users" fill={semanticColors.success} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
          mt: 3,
        }}
      >
        {data.map((item) => (
          <Box
            key={item.ageRange}
            sx={{
              p: 2,
              border: '1px solid #E0E0E0',
              borderRadius: 2,
              backgroundColor: '#FAFAFA',
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              {item.ageRange}
            </Typography>
            <Typography variant="body2">{item.userCount.toLocaleString()} users</Typography>
            <Typography variant="caption" color="textSecondary">
              Activity: {item.activityRate.toFixed(1)}%
            </Typography>
            <br />
            <Typography variant="caption" color="textSecondary">
              Avg Reading: {item.avgReadingMinutes.toFixed(0)} min
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
