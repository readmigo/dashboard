import { Box, Typography, Tooltip, Stack } from '@mui/material';
import { brandColors } from '../../../theme/brandTokens';

interface TimePattern {
  hour: number;
  totalMinutes: number;
  sessionsCount: number;
  uniqueUsers: number;
}

interface TimeHeatmapProps {
  patterns: TimePattern[];
}

export const TimeHeatmap = ({ patterns }: TimeHeatmapProps) => {
  const sortedPatterns = [...patterns].sort((a, b) => a.hour - b.hour);
  const maxMinutes = Math.max(...patterns.map((p) => p.totalMinutes), 1);

  const getColor = (minutes: number) => {
    const intensity = minutes / maxMinutes;
    if (intensity > 0.8) return brandColors.primary;
    if (intensity > 0.6) return brandColors.accentPurple;
    if (intensity > 0.4) return '#B8A9F4';
    if (intensity > 0.2) return '#D6C6F6';
    return '#E8E0FA';
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Reading Activity by Hour
      </Typography>
      <Stack spacing={0.5}>
        {sortedPatterns.map((pattern) => {
          const hourLabel = formatHour(pattern.hour);
          const barWidth = (pattern.totalMinutes / maxMinutes) * 100;

          return (
            <Tooltip
              key={pattern.hour}
              title={
                <Box>
                  <Typography variant="body2">
                    <strong>{hourLabel}</strong>
                  </Typography>
                  <Typography variant="caption">
                    {pattern.totalMinutes.toLocaleString()} minutes
                  </Typography>
                  <br />
                  <Typography variant="caption">
                    {pattern.sessionsCount} sessions
                  </Typography>
                  <br />
                  <Typography variant="caption">
                    {pattern.uniqueUsers} users
                  </Typography>
                </Box>
              }
              arrow
              placement="right"
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    width: 60,
                    flexShrink: 0,
                    fontWeight: 500,
                    color: 'text.secondary',
                  }}
                >
                  {hourLabel}
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      height: 24,
                      width: `${barWidth}%`,
                      minWidth: pattern.totalMinutes > 0 ? 4 : 0,
                      backgroundColor: getColor(pattern.totalMinutes),
                      borderRadius: 1,
                      transition: 'width 0.3s ease',
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {pattern.totalMinutes.toLocaleString()} min
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
};
