import { Card, CardContent, Typography } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTranslate } from 'react-admin';
import { chartPalette, textColors } from '../../../theme/brandTokens';
import { costConfig } from '../../../config/costConfig';
import type { ServiceCost, CostCategory } from '../../../config/costConfig';

interface CostTrendChartProps {
  services: ServiceCost[];
}

const MONTH_LABELS: Record<string, string> = {
  '2025-09': 'Sep',
  '2025-10': 'Oct',
  '2025-11': 'Nov',
  '2025-12': 'Dec',
  '2026-01': 'Jan',
  '2026-02': 'Feb',
};

const CATEGORY_COLOR_MAP: Record<CostCategory, string> = {
  compute: chartPalette[1],
  database: chartPalette[2],
  cache: chartPalette[3],
  storage: chartPalette[4],
  monitoring: chartPalette[5],
  selfHosted: chartPalette[6],
  other: chartPalette[0],
};

const buildChartData = (services: ServiceCost[]) => {
  const months = ['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02'];

  return months.map((month) => {
    const point: Record<string, string | number> = {
      month: MONTH_LABELS[month] ?? month,
    };

    for (const cat of costConfig.categories) {
      const catServices = services.filter((s) => s.category === cat.id);
      point[cat.id] = catServices.reduce((sum, s) => {
        const entry = s.costs.find((c) => c.month === month);
        return sum + (entry?.actual ?? 0);
      }, 0);
    }

    return point;
  });
};

export const CostTrendChart = ({ services }: CostTrendChartProps) => {
  const translate = useTranslate();
  const data = buildChartData(services);

  const activeCategories = costConfig.categories.filter((cat) =>
    data.some((d) => (d[cat.id] as number) > 0),
  );

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: textColors.primary, mb: 2 }}>
          {translate('costManagement.trendChart.title', { _: 'Cost Trend (6 Months)' })}
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]} />
            <Legend />
            {activeCategories.map((cat) => (
              <Area
                key={cat.id}
                type="monotone"
                dataKey={cat.id}
                name={cat.label}
                stackId="1"
                stroke={CATEGORY_COLOR_MAP[cat.id]}
                fill={CATEGORY_COLOR_MAP[cat.id]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
