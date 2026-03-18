import { Box, Typography, Tooltip, Stack } from '@mui/material';
import { brandColors } from '../../../theme/brandTokens';

interface TimePattern {
  hour: number;
  totalSeconds: number;
  sessionsCount: number;
  uniqueUsers: number;
}

interface TimeHeatmapProps {
  patterns: TimePattern[];
}

const toMinutes = (seconds: number) => Math.round(seconds / 60);

export const TimeHeatmap = ({ patterns }: TimeHeatmapProps) => {
  const sortedPatterns = [...patterns].sort((a, b) => a.hour - b.hour);
  const maxSeconds = Math.max(...patterns.map((p) => p.totalSeconds), 1);

  const getColor = (seconds: number) => {
    const intensity = seconds / maxSeconds;
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
          const barWidth = (pattern.totalSeconds / maxSeconds) * 100;
          const minutes = toMinutes(pattern.totalSeconds);

          return (
            <Tooltip
              key={pattern.hour}
              title={
                <Box>
                  <Typography variant="body2">
                    <strong>{hourLabel}</strong>
                  </Typography>
                  <Typography variant="caption">
                    {minutes.toLocaleString()} minutes
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
                      minWidth: pattern.totalSeconds > 0 ? 4 : 0,
                      backgroundColor: getColor(pattern.totalSeconds),
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
                    {minutes.toLocaleString()} min
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
