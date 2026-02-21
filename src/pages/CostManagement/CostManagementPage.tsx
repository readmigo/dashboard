import { Box, Typography, Chip } from '@mui/material';
import { useTranslate } from 'react-admin';
import { costConfig } from '../../config/costConfig';
import { CostSummaryBar } from './components/CostSummaryBar';
import { FourYearTCO } from './components/FourYearTCO';
import { FreeTierUtilization } from './components/FreeTierUtilization';
import { CostTrendChart } from './components/CostTrendChart';
import { PerformanceCostMatrix } from './components/PerformanceCostMatrix';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { ServiceDetailTable } from './components/ServiceDetailTable';
import { BudgetAlerts } from './components/BudgetAlerts';
import { textColors } from '../../theme/brandTokens';

export const CostManagementPage = () => {
  const translate = useTranslate();

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: textColors.primary }}>
            {translate('costManagement.title', { _: 'Cost Management' })}
          </Typography>
          <Typography variant="body2" sx={{ color: textColors.secondary, mt: 0.5 }}>
            {translate('costManagement.subtitle', { _: 'Monitor service costs and manage budgets' })}
          </Typography>
        </Box>
        <Chip label={`Budget: $${costConfig.globalMonthlyBudget}/mo`} color="primary" variant="outlined" />
      </Box>

      {/* Budget Alerts */}
      <Box mb={3}>
        <BudgetAlerts services={costConfig.services} />
      </Box>

      {/* Summary Stats */}
      <Box mb={3}>
        <CostSummaryBar services={costConfig.services} globalBudget={costConfig.globalMonthlyBudget} />
      </Box>

      {/* 4-Year TCO */}
      <Box mb={3}>
        <FourYearTCO services={costConfig.services} />
      </Box>

      {/* Free Tier Utilization */}
      <Box mb={3}>
        <FreeTierUtilization services={costConfig.services} />
      </Box>

      {/* Trend Chart */}
      <Box mb={3}>
        <CostTrendChart services={costConfig.services} />
      </Box>

      {/* Performance vs Cost Matrix */}
      <Box mb={3}>
        <PerformanceCostMatrix services={costConfig.services} />
      </Box>

      {/* Category Breakdown */}
      <Box mb={3}>
        <CategoryBreakdown services={costConfig.services} categories={costConfig.categories} />
      </Box>

      {/* Service Detail Table */}
      <Box>
        <ServiceDetailTable services={costConfig.services} />
      </Box>
    </Box>
  );
};
