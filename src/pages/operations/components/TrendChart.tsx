import { Card, CardHeader, CardContent } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTimezone } from '../../../contexts/TimezoneContext';

interface TrendDataPoint {
  date: string;
  [key: string]: unknown;
}

interface TrendLine {
  key: string;
  name: string;
  color: string;
}

interface TrendChartProps {
  title: string;
  data: TrendDataPoint[];
  lines: TrendLine[];
  height?: number;
}

export const TrendChart = ({ title, data, lines, height = 300 }: TrendChartProps) => {
  const { timezone, formatDate } = useTimezone();

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} />
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  timeZone: timezone,
                  month: 'numeric',
                  day: 'numeric',
                });
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(value) => formatDate(value as string)}
            />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
