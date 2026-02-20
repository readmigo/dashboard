import { useTranslate } from 'react-admin';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import DnsOutlined from '@mui/icons-material/DnsOutlined';
import StorageOutlined from '@mui/icons-material/StorageOutlined';
import MemoryOutlined from '@mui/icons-material/MemoryOutlined';
import CloudQueueOutlined from '@mui/icons-material/CloudQueueOutlined';
import MonitorHeartOutlined from '@mui/icons-material/MonitorHeartOutlined';
import MoreHorizOutlined from '@mui/icons-material/MoreHorizOutlined';
import { PieChart, Pie, Cell } from 'recharts';
import type { CostCategory, ServiceCost } from '../../../config/costConfig';
import { chartPalette, semanticColors, textColors, bgColors, alpha } from '../../../theme/brandTokens';

const CURRENT_MONTH = '2026-02';

const categoryIcons: Record<CostCategory, React.ReactNode> = {
  compute: <DnsOutlined />,
  database: <StorageOutlined />,
  cache: <MemoryOutlined />,
  storage: <CloudQueueOutlined />,
  monitoring: <MonitorHeartOutlined />,
  other: <MoreHorizOutlined />,
};

interface CategoryBreakdownProps {
  services: ServiceCost[];
  categories: { id: CostCategory; label: string; icon: string }[];
}

export const CategoryBreakdown = ({ services, categories }: CategoryBreakdownProps) => {
  const translate = useTranslate();

  const categoryData = categories.map((cat, index) => {
    const catServices = services.filter((s) => s.category === cat.id);
    const totalCost = catServices.reduce((sum, s) => {
      const monthCost = s.costs.find((c) => c.month === CURRENT_MONTH);
      return sum + (monthCost?.actual ?? 0);
    }, 0);
    const totalBudget = catServices.reduce((sum, s) => sum + s.monthlyBudget, 0);
    const usagePercent = totalBudget > 0 ? (totalCost / totalBudget) * 100 : 0;
    const color = chartPalette[index % chartPalette.length];

    return { ...cat, totalCost, totalBudget, usagePercent, color };
  });

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: textColors.primary }}>
        {translate('costManagement.categoryBreakdown', { _: 'Category Breakdown' })}
      </Typography>
      <Grid container spacing={3}>
        {categoryData.map((cat) => {
          const pieData = [
            { name: 'used', value: cat.totalCost },
            { name: 'remaining', value: Math.max(0, cat.totalBudget - cat.totalCost) },
          ];
          const hasBudget = cat.totalBudget > 0;
          const statusColor =
            cat.usagePercent > 90
              ? semanticColors.error
              : cat.usagePercent > 70
                ? semanticColors.warning
                : semanticColors.success;

          return (
            <Grid item xs={12} sm={6} md={3} key={cat.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: `0 4px 16px ${alpha(cat.color, 0.2)}`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Box
                          sx={{
                            color: cat.color,
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: alpha(cat.color, 0.1),
                            borderRadius: 1,
                            p: 0.5,
                          }}
                        >
                          {categoryIcons[cat.id]}
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: textColors.primary }}>
                          {translate(`costManagement.categories.${cat.id}`, { _: cat.label })}
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: textColors.primary, mb: 0.5 }}>
                        ${cat.totalCost.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: textColors.secondary }}>
                        {hasBudget
                          ? translate('costManagement.ofBudget', {
                              budget: `$${cat.totalBudget.toFixed(0)}`,
                              _: `of $${cat.totalBudget.toFixed(0)} budget`,
                            })
                          : translate('costManagement.freeTier', { _: 'Free tier' })}
                      </Typography>
                    </Box>
                    {hasBudget && (
                      <Box sx={{ width: 80, height: 80, flexShrink: 0 }}>
                        <PieChart width={80} height={80}>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            cx={35}
                            cy={35}
                            innerRadius={22}
                            outerRadius={35}
                            startAngle={90}
                            endAngle={-270}
                            strokeWidth={0}
                          >
                            <Cell fill={statusColor} />
                            <Cell fill={bgColors.subtle} />
                          </Pie>
                        </PieChart>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            textAlign: 'center',
                            mt: -5.5,
                            fontWeight: 600,
                            color: statusColor,
                            fontSize: 11,
                          }}
                        >
                          {cat.usagePercent.toFixed(0)}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
