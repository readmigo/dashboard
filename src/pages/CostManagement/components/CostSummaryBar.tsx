import { Card, CardContent, Typography, Box, Grid, LinearProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useTranslate } from 'react-admin';
import { semanticColors, textColors } from '../../../theme/brandTokens';
import type { ServiceCost } from '../../../config/costConfig';

interface CostSummaryBarProps {
  services: ServiceCost[];
  globalBudget: number;
}

const CURRENT_MONTH = '2026-02';
const PREVIOUS_MONTH = '2026-01';

const getMonthTotal = (services: ServiceCost[], month: string): number =>
  services.reduce((sum, s) => {
    const entry = s.costs.find((c) => c.month === month);
    return sum + (entry?.actual ?? 0);
  }, 0);

export const CostSummaryBar = ({ services, globalBudget }: CostSummaryBarProps) => {
  const translate = useTranslate();

  const currentTotal = getMonthTotal(services, CURRENT_MONTH);
  const previousTotal = getMonthTotal(services, PREVIOUS_MONTH);
  const budgetUsage = globalBudget > 0 ? (currentTotal / globalBudget) * 100 : 0;
  const momChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
  const budgetRemaining = globalBudget - currentTotal;

  const getBudgetColor = (pct: number) => {
    if (pct > 90) return semanticColors.error;
    if (pct >= 70) return semanticColors.warning;
    return semanticColors.success;
  };

  return (
    <Grid container spacing={3}>
      {/* Total Cost */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="overline" sx={{ color: textColors.secondary }}>
              {translate('costManagement.summary.totalCost', { _: 'Total Cost This Month' })}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: textColors.primary, mt: 1 }}>
              ${currentTotal.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Budget Usage */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="overline" sx={{ color: textColors.secondary }}>
              {translate('costManagement.summary.budgetUsage', { _: 'Budget Usage' })}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: textColors.primary, mt: 1 }}>
              {budgetUsage.toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(budgetUsage, 100)}
              sx={{
                mt: 1.5,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.08)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getBudgetColor(budgetUsage),
                  borderRadius: 4,
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Month-over-Month Change */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="overline" sx={{ color: textColors.secondary }}>
              {translate('costManagement.summary.momChange', { _: 'Month-over-Month' })}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              {momChange >= 0 ? (
                <TrendingUpIcon sx={{ color: semanticColors.error, mr: 0.5, fontSize: 28 }} />
              ) : (
                <TrendingDownIcon sx={{ color: semanticColors.success, mr: 0.5, fontSize: 28 }} />
              )}
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: momChange >= 0 ? semanticColors.error : semanticColors.success }}
              >
                {momChange >= 0 ? '+' : ''}{momChange.toFixed(1)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Budget Remaining */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="overline" sx={{ color: textColors.secondary }}>
              {translate('costManagement.summary.budgetRemaining', { _: 'Budget Remaining' })}
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: budgetRemaining >= 0 ? semanticColors.success : semanticColors.error,
                mt: 1,
              }}
            >
              ${budgetRemaining.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
