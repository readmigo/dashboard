import { useMemo } from 'react';
import { useTranslate } from 'react-admin';
import { Card, CardHeader, CardContent, Alert, Box, Typography } from '@mui/material';
import type { ServiceCost } from '../../../config/costConfig';
import { textColors } from '../../../theme/brandTokens';

const CURRENT_MONTH = '2026-02';

interface BudgetAlertsProps {
  services: ServiceCost[];
}

export const BudgetAlerts = ({ services }: BudgetAlertsProps) => {
  const translate = useTranslate();

  const alerts = useMemo(() => {
    return services
      .filter((s) => s.monthlyBudget > 0)
      .map((s) => {
        const cost = s.costs.find((c) => c.month === CURRENT_MONTH)?.actual ?? 0;
        const usage = (cost / s.monthlyBudget) * 100;
        return { service: s, cost, usage };
      })
      .filter((a) => a.usage > 70)
      .sort((a, b) => b.usage - a.usage);
  }, [services]);

  return (
    <Card>
      <CardHeader
        title={translate('costManagement.budgetAlerts', { _: 'Budget Alerts' })}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {alerts.length === 0 ? (
            <Alert severity="success">
              {translate('costManagement.allWithinBudget', { _: 'All services within budget' })}
            </Alert>
          ) : (
            alerts.map((a) => (
              <Alert
                key={a.service.id}
                severity={a.usage > 90 ? 'error' : 'warning'}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, color: textColors.primary }}>
                  <strong>{a.service.name}</strong>
                  {' — '}
                  {translate('costManagement.alertDetail', {
                    cost: `$${a.cost.toFixed(2)}`,
                    budget: `$${a.service.monthlyBudget.toFixed(0)}`,
                    usage: `${a.usage.toFixed(0)}%`,
                    _: `$${a.cost.toFixed(2)} of $${a.service.monthlyBudget.toFixed(0)} budget (${a.usage.toFixed(0)}%)`,
                  })}
                </Typography>
              </Alert>
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
