import { useState, useMemo } from 'react';
import { useTranslate } from 'react-admin';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Box,
  Link,
  Typography,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import type { ServiceCost } from '../../../config/costConfig';
import { semanticColors, textColors, bgColors, brandColors } from '../../../theme/brandTokens';

const CURRENT_MONTH = '2026-02';

type SortKey = 'name' | 'provider' | 'category' | 'cost' | 'budget' | 'usage' | 'status';
type SortDir = 'asc' | 'desc';

interface ServiceDetailTableProps {
  services: ServiceCost[];
}

function getMonthCost(service: ServiceCost): number {
  return service.costs.find((c) => c.month === CURRENT_MONTH)?.actual ?? 0;
}

function getUsagePercent(service: ServiceCost): number {
  if (service.monthlyBudget <= 0) return -1; // free tier marker
  return (getMonthCost(service) / service.monthlyBudget) * 100;
}

function getStatusLevel(usage: number): 'ok' | 'warning' | 'error' | 'free' {
  if (usage < 0) return 'free';
  if (usage > 90) return 'error';
  if (usage > 70) return 'warning';
  return 'ok';
}

const statusColorMap = {
  ok: semanticColors.success,
  warning: semanticColors.warning,
  error: semanticColors.error,
  free: textColors.hint,
};

export const ServiceDetailTable = ({ services }: ServiceDetailTableProps) => {
  const translate = useTranslate();
  const [sortKey, setSortKey] = useState<SortKey>('usage');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    const arr = [...services];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'provider':
          return dir * a.provider.localeCompare(b.provider);
        case 'category':
          return dir * a.category.localeCompare(b.category);
        case 'cost':
          return dir * (getMonthCost(a) - getMonthCost(b));
        case 'budget':
          return dir * (a.monthlyBudget - b.monthlyBudget);
        case 'usage':
        case 'status':
          return dir * (getUsagePercent(a) - getUsagePercent(b));
        default:
          return 0;
      }
    });
    return arr;
  }, [services, sortKey, sortDir]);

  const columns: { key: SortKey; labelKey: string; fallback: string; align?: 'right' | 'left' | 'center' }[] = [
    { key: 'name', labelKey: 'costManagement.table.service', fallback: 'Service' },
    { key: 'provider', labelKey: 'costManagement.table.provider', fallback: 'Provider' },
    { key: 'category', labelKey: 'costManagement.table.category', fallback: 'Category' },
    { key: 'cost', labelKey: 'costManagement.table.monthlyCost', fallback: 'Monthly Cost', align: 'right' },
    { key: 'budget', labelKey: 'costManagement.table.budget', fallback: 'Budget', align: 'right' },
    { key: 'usage', labelKey: 'costManagement.table.usage', fallback: 'Usage %', align: 'right' },
    { key: 'status', labelKey: 'costManagement.table.status', fallback: 'Status', align: 'center' },
  ];

  return (
    <Card>
      <CardHeader
        title={translate('costManagement.serviceDetails', { _: 'Service Details' })}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
      />
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: bgColors.light }}>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align ?? 'left'}>
                  <TableSortLabel
                    active={sortKey === col.key}
                    direction={sortKey === col.key ? sortDir : 'asc'}
                    onClick={() => handleSort(col.key)}
                    sx={{ fontWeight: 600, color: textColors.secondary }}
                  >
                    {translate(col.labelKey, { _: col.fallback })}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((service) => {
              const cost = getMonthCost(service);
              const usage = getUsagePercent(service);
              const status = getStatusLevel(usage);
              const statusColor = statusColorMap[status];

              return (
                <TableRow key={service.id} hover>
                  <TableCell>
                    {service.url ? (
                      <Link
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: brandColors.primary, fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {service.name}
                      </Link>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 500, color: textColors.primary }}>
                        {service.name}
                      </Typography>
                    )}
                    {service.note && (
                      <Typography variant="caption" sx={{ display: 'block', color: textColors.hint }}>
                        {service.note}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: textColors.secondary }}>
                      {service.provider}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={translate(`costManagement.categories.${service.category}`, { _: service.category })}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 12 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: textColors.primary }}>
                      ${cost.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ color: textColors.secondary }}>
                      {service.monthlyBudget > 0 ? `$${service.monthlyBudget.toFixed(0)}` : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {status === 'free' ? (
                      <Chip
                        label={translate('costManagement.free', { _: 'Free' })}
                        size="small"
                        sx={{ backgroundColor: bgColors.subtle, color: textColors.hint, fontWeight: 500, fontSize: 12 }}
                      />
                    ) : (
                      <Chip
                        label={`${usage.toFixed(0)}%`}
                        size="small"
                        sx={{
                          backgroundColor:
                            status === 'ok'
                              ? `${semanticColors.success}1A`
                              : status === 'warning'
                                ? `${semanticColors.warning}1A`
                                : `${semanticColors.error}1A`,
                          color: statusColor,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <CircleIcon sx={{ fontSize: 10, color: statusColor }} />
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
