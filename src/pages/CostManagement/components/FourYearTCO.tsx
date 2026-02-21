import { Card, CardContent, Typography, Box, Grid, Chip } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTranslate } from 'react-admin';
import { chartPalette, textColors, bgColors, semanticColors, alpha } from '../../../theme/brandTokens';
import type { ServiceCost } from '../../../config/costConfig';

interface FourYearTCOProps {
  services: ServiceCost[];
}

const CURRENT_MONTH = '2026-02';
const YEARS = 4;
const MONTHS_TOTAL = YEARS * 12;

export const FourYearTCO = ({ services }: FourYearTCOProps) => {
  const translate = useTranslate();

  const infraServices = services.filter((s) => s.classification === 'infrastructure');
  const devtoolServices = services.filter((s) => s.classification === 'devtool');

  const getMonthCost = (svcs: ServiceCost[]) =>
    svcs.reduce((sum, s) => {
      const entry = s.costs.find((c) => c.month === CURRENT_MONTH);
      return sum + (entry?.actual ?? 0);
    }, 0);

  const infraMonthly = getMonthCost(infraServices);
  const devtoolMonthly = getMonthCost(devtoolServices);
  const totalMonthly = infraMonthly + devtoolMonthly;

  const infraTotal = infraMonthly * MONTHS_TOTAL;
  const devtoolTotal = devtoolMonthly * MONTHS_TOTAL;
  const grandTotal = totalMonthly * MONTHS_TOTAL;

  const devtoolPct = grandTotal > 0 ? (devtoolTotal / grandTotal) * 100 : 0;

  // Build chart data: cumulative by year
  const chartData = Array.from({ length: YEARS }, (_, i) => {
    const year = i + 1;
    return {
      year: `${translate('costManagement.tco.year', { _: 'Year' })} ${year}`,
      infrastructure: Math.round(infraMonthly * 12 * year),
      devtools: Math.round(devtoolMonthly * 12 * year),
    };
  });

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: textColors.primary }}>
        {translate('costManagement.tco.title', { _: '4-Year Total Cost of Ownership' })}
      </Typography>

      <Grid container spacing={3}>
        {/* Grand Total */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${chartPalette[1]} 0%, ${chartPalette[2]} 100%)` }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {translate('costManagement.tco.grandTotal', { _: '4-Year Grand Total' })}
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff', mt: 1 }}>
                ${grandTotal.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                ${totalMonthly.toFixed(2)}/mo x 48
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Infrastructure Only */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: textColors.secondary }}>
                {translate('costManagement.tco.infraOnly', { _: '4-Year Infrastructure' })}
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: semanticColors.success, mt: 1 }}>
                ${infraTotal.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: textColors.hint }}>
                ${infraMonthly.toFixed(2)}/mo x 48
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Dev Tools */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: textColors.secondary }}>
                {translate('costManagement.tco.devtoolOnly', { _: '4-Year Dev Tools' })}
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: chartPalette[3], mt: 1 }}>
                ${devtoolTotal.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: textColors.hint }}>
                ${devtoolMonthly.toFixed(2)}/mo x 48
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Insight */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: bgColors.subtle }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: textColors.secondary }}>
                {translate('costManagement.tco.insight', { _: 'Key Insight' })}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={`${translate('costManagement.tco.devtoolShare', { _: 'Dev tools' })}: ${devtoolPct.toFixed(1)}%`}
                  sx={{
                    backgroundColor: alpha(semanticColors.warning, 0.15),
                    color: semanticColors.warning,
                    fontWeight: 700,
                    fontSize: 14,
                    height: 36,
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: textColors.hint, display: 'block', mt: 1 }}>
                {translate('costManagement.tco.insightDesc', {
                  _: 'Without dev tools, 4yr cost drops to',
                })}{' '}
                <strong>${infraTotal.toLocaleString()}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cumulative Bar Chart */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ color: textColors.secondary, mb: 2 }}>
            {translate('costManagement.tco.cumulativeChart', { _: 'Cumulative Cost by Year' })}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
              <Legend />
              <Bar
                dataKey="infrastructure"
                name={translate('costManagement.tco.infrastructure', { _: 'Infrastructure' })}
                stackId="a"
                fill={chartPalette[1]}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="devtools"
                name={translate('costManagement.tco.devtools', { _: 'Dev Tools' })}
                stackId="a"
                fill={chartPalette[3]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
};
