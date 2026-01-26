import { Box, LinearProgress, Typography } from '@mui/material';

interface ProgressBarProps {
  total: number;
  completed: number;
  skipped: number;
  failed: number;
  percentage: number;
}

export function ProgressBar({ total, completed, skipped, failed, percentage }: ProgressBarProps) {
  const processed = completed + skipped + failed;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          Progress
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {processed}/{total} ({percentage}%)
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          },
        }}
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <Typography variant="caption" color="success.main">
          Completed: {completed}
        </Typography>
        <Typography variant="caption" color="info.main">
          Skipped: {skipped}
        </Typography>
        <Typography variant="caption" color="error.main">
          Failed: {failed}
        </Typography>
      </Box>
    </Box>
  );
}
