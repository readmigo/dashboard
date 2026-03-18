import { Box, Typography, LinearProgress, Grid } from '@mui/material';
import { brandColors } from '../../../theme/brandTokens';

interface CategoryStats {
  categoryId: string;
  categoryName: string;
  totalReadingSeconds: number;
  percentage: number;
  uniqueReaders: number;
  booksCount: number;
  averageSecondsPerUser: number;
}

interface CategoryChartProps {
  categories: CategoryStats[];
}

const toMinutes = (seconds: number) => Math.round(seconds / 60);

export const CategoryChart = ({ categories }: CategoryChartProps) => {
  if (categories.length === 0) {
    return (
      <Box p={2}>
        <Typography color="textSecondary">No category data available</Typography>
      </Box>
    );
  }

  const maxSeconds = Math.max(...categories.map((c) => c.totalReadingSeconds));

  return (
    <Box>
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} md={6} key={category.categoryId}>
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body1" fontWeight="medium">
                  {category.categoryName}
                </Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">
                  {category.percentage.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(category.totalReadingSeconds / maxSeconds) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 1,
                  backgroundColor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: brandColors.primary,
                  },
                }}
              />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="textSecondary">
                  {toMinutes(category.totalReadingSeconds).toLocaleString()} min • {category.uniqueReaders} readers • {category.booksCount} books
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {(category.averageSecondsPerUser / 60).toFixed(1)} min/user
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
