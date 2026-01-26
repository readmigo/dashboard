import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: number;
  changeLabel?: string;
}

export const StatCard = ({ title, value, icon, color, change, changeLabel }: StatCardProps) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" variant="overline" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {isPositive ? (
                  <TrendingUpIcon fontSize="small" sx={{ color: '#6ED6A8', mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon fontSize="small" sx={{ color: '#FF6B6B', mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ color: isPositive ? '#6ED6A8' : '#FF6B6B' }}
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
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
