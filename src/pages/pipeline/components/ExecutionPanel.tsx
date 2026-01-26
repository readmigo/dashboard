import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslate } from 'react-admin';
import { PipelineStatus, BookStatus } from '../hooks/usePipelineStatus';
import { ProgressBar } from './ProgressBar';
import { BookStatusList } from './BookStatusList';

interface ExecutionPanelProps {
  status: PipelineStatus | null;
  books: BookStatus[];
  onCancel: () => void;
  loading?: boolean;
}

const stageNames: Record<string, string> = {
  '1': 'Input Parsing',
  '2': 'Environment Preparation',
  '3': 'Book Matching',
  '4': 'Book Import',
  '5': 'Related Data Calculation',
  '6': 'Booklist Association',
  '7': 'Validation',
  '8': 'Report Generation',
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

export function ExecutionPanel({ status, books, onCancel, loading }: ExecutionPanelProps) {
  const translate = useTranslate();

  if (loading || !status) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Starting pipeline...</Typography>
      </Box>
    );
  }

  const isRunning = status.status === 'running' || status.status === 'pending';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {translate('pipeline.executionStatus', { _: 'Pipeline Execution' })}
        </Typography>
        {isRunning && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={onCancel}
          >
            {translate('pipeline.cancel', { _: 'Cancel' })}
          </Button>
        )}
      </Box>

      {/* Status overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              label={status.status.toUpperCase()}
              color={
                status.status === 'running'
                  ? 'primary'
                  : status.status === 'completed'
                    ? 'success'
                    : status.status === 'failed'
                      ? 'error'
                      : 'default'
              }
            />
            <Typography variant="body2" color="text.secondary">
              Stage {status.currentStage}: {stageNames[status.currentStage] || status.currentStageName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              Elapsed: {formatDuration(status.elapsedSeconds)}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <ProgressBar
            total={status.progress.total}
            completed={status.progress.completed}
            skipped={status.progress.skipped}
            failed={status.progress.failed}
            percentage={status.progress.percentage}
          />

          {status.currentBook && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Currently processing:
              </Typography>
              <Typography variant="body2">
                {status.currentBook.title} - {status.currentBook.author}
              </Typography>
              <Chip label={status.currentBook.status} size="small" sx={{ mt: 0.5 }} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Stats cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4">{status.progress.total}</Typography>
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4" color="success.main">
                {status.progress.completed}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4" color="info.main">
                {status.progress.skipped}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Skipped
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4" color="error.main">
                {status.progress.failed}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Book list */}
      <BookStatusList books={books} />
    </Box>
  );
}
