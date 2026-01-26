import { Box, Typography, LinearProgress, Grid } from '@mui/material';

interface CategoryStats {
  categoryId: string;
  categoryName: string;
  totalReadingMinutes: number;
  percentage: number;
  uniqueReaders: number;
  booksCount: number;
  averageMinutesPerUser: number;
}

interface CategoryChartProps {
  categories: CategoryStats[];
}

export const CategoryChart = ({ categories }: CategoryChartProps) => {
  const maxMinutes = Math.max(...categories.map((c) => c.totalReadingMinutes));

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
                value={(category.totalReadingMinutes / maxMinutes) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 1,
                  backgroundColor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#7C8DF5',
                  },
                }}
              />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="textSecondary">
                  {category.totalReadingMinutes.toLocaleString()} min • {category.uniqueReaders} readers • {category.booksCount} books
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {category.averageMinutesPerUser.toFixed(1)} min/user
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
