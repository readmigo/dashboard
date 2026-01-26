import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface ChannelRetention {
  channel: string;
  totalUsers: number;
  d1Rate: number;
  d7Rate: number;
  d30Rate: number;
  d1Retained: number;
  d7Retained: number;
  d30Retained: number;
}

interface ChannelComparisonProps {
  data: ChannelRetention[];
}

export const ChannelComparison = ({ data }: ChannelComparisonProps) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Retention by Channel
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={2}>
        Compare retention rates across different user acquisition channels
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'Retention Rate (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(1)}%`}
            labelFormatter={(label) => `Channel: ${label}`}
          />
          <Legend />
          <Bar dataKey="d1Rate" name="D1 Retention" fill="#7C8DF5" />
          <Bar dataKey="d7Rate" name="D7 Retention" fill="#9A8CF2" />
          <Bar dataKey="d30Rate" name="D30 Retention" fill="#6ED6A8" />
        </BarChart>
      </ResponsiveContainer>

      {/* Data Table */}
      <Box mt={4}>
        <Typography variant="subtitle2" gutterBottom>
          Detailed Channel Statistics
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 2,
            mt: 2,
          }}
        >
          {data.map((channel) => (
            <Box
              key={channel.channel}
              sx={{
                p: 2,
                border: '1px solid #E0E0E0',
                borderRadius: 2,
                backgroundColor: '#FAFAFA',
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {channel.channel}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total Users: {channel.totalUsers.toLocaleString()}
              </Typography>
              <Box mt={1}>
                <Typography variant="body2">
                  D1: {channel.d1Rate.toFixed(1)}% ({channel.d1Retained} users)
                </Typography>
                <Typography variant="body2">
                  D7: {channel.d7Rate.toFixed(1)}% ({channel.d7Retained} users)
                </Typography>
                <Typography variant="body2">
                  D30: {channel.d30Rate.toFixed(1)}% ({channel.d30Retained} users)
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
