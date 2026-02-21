import { Card, CardContent, Typography, Box, Grid, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { useTranslate } from 'react-admin';
import { semanticColors, textColors, chartPalette, alpha } from '../../../theme/brandTokens';
import type { ServiceCost } from '../../../config/costConfig';

interface FreeTierUtilizationProps {
  services: ServiceCost[];
}

const CURRENT_MONTH = '2026-02';

export const FreeTierUtilization = ({ services }: FreeTierUtilizationProps) => {
  const translate = useTranslate();

  const freeServices = services.filter((s) => {
    const cost = s.costs.find((c) => c.month === CURRENT_MONTH)?.actual ?? 0;
    return cost === 0;
  });

  const paidWithFreeTier = services.filter((s) => {
    const cost = s.costs.find((c) => c.month === CURRENT_MONTH)?.actual ?? 0;
    return cost > 0 && s.freeTier;
  });

  const totalServices = services.length;
  const freeCount = freeServices.length;
  const monthlySavings = freeServices.reduce((sum, s) => {
    // Estimate savings from free tier by looking at the cheapest paid tier
    const cheapestPaid = s.performanceTiers?.find((t) => t.monthlyCost > 0);
    return sum + (cheapestPaid?.monthlyCost ?? 0);
  }, 0);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: textColors.primary }}>
        {translate('costManagement.freeTierUtil.title', { _: 'Free Tier Utilization' })}
      </Typography>

      {/* Summary Header */}
      <Card sx={{ mb: 3, backgroundColor: alpha(semanticColors.success, 0.06) }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <MoneyOffIcon sx={{ fontSize: 36, color: semanticColors.success }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: semanticColors.success }}>
                    {freeCount}/{totalServices}
                  </Typography>
                  <Typography variant="caption" sx={{ color: textColors.secondary }}>
                    {translate('costManagement.freeTierUtil.servicesOnFree', { _: 'services at $0/mo' })}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="overline" sx={{ color: textColors.secondary }}>
                {translate('costManagement.freeTierUtil.estimatedSavings', { _: 'Est. Monthly Savings' })}
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: textColors.primary }}>
                ${monthlySavings.toFixed(0)}/mo
              </Typography>
              <Typography variant="caption" sx={{ color: textColors.hint }}>
                {translate('costManagement.freeTierUtil.vsLowestPaid', { _: 'vs lowest paid tier' })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="overline" sx={{ color: textColors.secondary }}>
                {translate('costManagement.freeTierUtil.fourYearSavings', { _: '4-Year Savings' })}
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: semanticColors.success }}>
                ${(monthlySavings * 48).toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: textColors.hint }}>
                {translate('costManagement.freeTierUtil.byUsingFree', { _: 'by using free tiers' })}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Free-tier services */}
      <Grid container spacing={2}>
        {freeServices.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <Card
              sx={{
                height: '100%',
                borderLeft: `3px solid ${semanticColors.success}`,
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: textColors.primary }}>
                    {service.name}
                  </Typography>
                  <Chip
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: '14px !important' }} />}
                    label={translate('costManagement.freeTierUtil.free', { _: 'FREE' })}
                    size="small"
                    sx={{
                      backgroundColor: alpha(semanticColors.success, 0.12),
                      color: semanticColors.success,
                      fontWeight: 600,
                      fontSize: 11,
                      height: 24,
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: textColors.hint }}>
                  {service.provider}
                </Typography>
                {service.freeTier && (
                  <Typography variant="body2" sx={{ color: textColors.secondary, mt: 1, fontSize: 12 }}>
                    {service.freeTier.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Paid services that have a free tier alternative */}
        {paidWithFreeTier.map((service) => {
          const currentCost = service.costs.find((c) => c.month === CURRENT_MONTH)?.actual ?? 0;
          return (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card
                sx={{
                  height: '100%',
                  borderLeft: `3px solid ${chartPalette[3]}`,
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ color: textColors.primary }}>
                      {service.name}
                    </Typography>
                    <Chip
                      label={`$${currentCost.toFixed(2)}/mo`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(chartPalette[3], 0.12),
                        color: chartPalette[3],
                        fontWeight: 600,
                        fontSize: 11,
                        height: 24,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: textColors.hint }}>
                    {service.provider}
                  </Typography>
                  {service.freeTier && (
                    <Typography variant="body2" sx={{ color: textColors.secondary, mt: 1, fontSize: 12 }}>
                      {translate('costManagement.freeTierUtil.freeAvailable', { _: 'Free tier available' })}:{' '}
                      {service.freeTier.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
