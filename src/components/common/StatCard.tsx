import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { semanticColors } from '../../theme/brandTokens';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  change?: number;
  changeLabel?: string;
  subtitle?: string;
}

export const StatCard = ({
  title,
  value,
  icon,
  color,
  loading = false,
  change,
  changeLabel,
  subtitle,
}: StatCardProps) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width="60%" height={48} />
            ) : (
              <Typography variant="h4" fontWeight="bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {isPositive ? (
                  <TrendingUpIcon fontSize="small" sx={{ color: semanticColors.success, mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon fontSize="small" sx={{ color: semanticColors.error, mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ color: isPositive ? semanticColors.success : semanticColors.error }}
                >
                  {isPositive ? '+' : ''}{change}%
                </Typography>
                {changeLabel && (
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                    {changeLabel}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 2,
              p: 1.5,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
