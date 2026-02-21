import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Box,
} from '@mui/material';
import { useTranslate } from 'react-admin';
import { textColors, bgColors, semanticColors, chartPalette, alpha } from '../../../theme/brandTokens';
import type { ServiceCost } from '../../../config/costConfig';

interface PerformanceCostMatrixProps {
  services: ServiceCost[];
}

export const PerformanceCostMatrix = ({ services }: PerformanceCostMatrixProps) => {
  const translate = useTranslate();

  const servicesWithTiers = services.filter(
    (s) => s.performanceTiers && s.performanceTiers.length > 0,
  );

  if (servicesWithTiers.length === 0) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: textColors.primary }}>
        {translate('costManagement.perfMatrix.title', { _: 'Performance vs Cost' })}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: textColors.secondary }}>
        {translate('costManagement.perfMatrix.subtitle', {
          _: 'Compare what you get at each pricing tier. At $0, performance is limited to free-tier allowances.',
        })}
      </Typography>

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: bgColors.light }}>
                <TableCell sx={{ fontWeight: 600, color: textColors.secondary, minWidth: 140 }}>
                  {translate('costManagement.perfMatrix.service', { _: 'Service' })}
                </TableCell>
                {/* Up to 3 tier columns */}
                <TableCell align="center" sx={{ fontWeight: 600, color: textColors.secondary, minWidth: 200 }}>
                  <Chip
                    label={translate('costManagement.perfMatrix.tier1', { _: 'Free / Low' })}
                    size="small"
                    sx={{
                      backgroundColor: alpha(semanticColors.success, 0.12),
                      color: semanticColors.success,
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColors.secondary, minWidth: 200 }}>
                  <Chip
                    label={translate('costManagement.perfMatrix.tier2', { _: 'Current' })}
                    size="small"
                    sx={{
                      backgroundColor: alpha(chartPalette[1], 0.12),
                      color: chartPalette[1],
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColors.secondary, minWidth: 200 }}>
                  <Chip
                    label={translate('costManagement.perfMatrix.tier3', { _: 'Next Tier' })}
                    size="small"
                    sx={{
                      backgroundColor: alpha(chartPalette[2], 0.12),
                      color: chartPalette[2],
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicesWithTiers.map((service) => {
                const tiers = service.performanceTiers!;
                const tier1 = tiers[0];
                const tier2 = tiers[1];
                const tier3 = tiers[2];

                return (
                  <TableRow key={service.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ color: textColors.primary }}>
                        {service.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: textColors.hint }}>
                        {service.provider}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {tier1 && <TierCell tier={tier1} variant="free" />}
                    </TableCell>
                    <TableCell align="center">
                      {tier2 && <TierCell tier={tier2} variant="current" />}
                    </TableCell>
                    <TableCell align="center">
                      {tier3 ? (
                        <TierCell tier={tier3} variant="next" />
                      ) : (
                        <Typography variant="caption" sx={{ color: textColors.hint }}>
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

function TierCell({ tier, variant }: { tier: { name: string; monthlyCost: number; description: string }; variant: 'free' | 'current' | 'next' }) {
  const colorMap = {
    free: semanticColors.success,
    current: chartPalette[1],
    next: chartPalette[2],
  };
  const color = colorMap[variant];

  return (
    <Box>
      <Typography variant="body2" fontWeight={700} sx={{ color }}>
        {tier.monthlyCost === 0 ? '$0' : `$${tier.monthlyCost}/mo`}
      </Typography>
      <Typography variant="caption" sx={{ color: textColors.secondary, display: 'block', mt: 0.5 }}>
        {tier.description}
      </Typography>
    </Box>
  );
}
