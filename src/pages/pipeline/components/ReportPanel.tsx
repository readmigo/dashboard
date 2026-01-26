import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Button,
  Link,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslate } from 'react-admin';
import { PipelineReport } from '../hooks/usePipelineStatus';

interface ReportPanelProps {
  report: PipelineReport;
  onReset: () => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function ReportPanel({ report, onReset }: ReportPanelProps) {
  const translate = useTranslate();

  const allSuccess = report.failures.length === 0 && report.healthCheck.apiHealth;

  return (
    <Box>
      {/* Header */}
      <Alert
        severity={allSuccess ? 'success' : 'warning'}
        icon={allSuccess ? <CheckCircleIcon /> : <ErrorIcon />}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle1">
          {allSuccess
            ? translate('pipeline.reportSuccess', { _: 'Pipeline Completed Successfully' })
            : translate('pipeline.reportWithIssues', { _: 'Pipeline Completed with Issues' })}
        </Typography>
      </Alert>

      {/* Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {translate('pipeline.summary', { _: 'Summary' })}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Environment
              </Typography>
              <Typography variant="body1">
                <Chip
                  label={report.environment}
                  size="small"
                  color={report.environment === 'production' ? 'error' : 'default'}
                />
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Booklist
              </Typography>
              <Typography variant="body2">{report.booklistFile}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Duration
              </Typography>
              <Typography variant="body1">{formatDuration(report.duration)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Batch ID
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {report.batchId}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Book Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Book Statistics
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={4} md={2}>
              <Typography variant="h4" textAlign="center">
                {report.summary.total}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Total
              </Typography>
            </Grid>
            <Grid item xs={4} md={2}>
              <Typography variant="h4" textAlign="center" color="primary.main">
                {report.summary.matched}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Matched
              </Typography>
            </Grid>
            <Grid item xs={4} md={2}>
              <Typography variant="h4" textAlign="center" color="success.main">
                {report.summary.imported}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Imported
              </Typography>
            </Grid>
            <Grid item xs={4} md={2}>
              <Typography variant="h4" textAlign="center" color="info.main">
                {report.summary.skipped}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Skipped
              </Typography>
            </Grid>
            <Grid item xs={4} md={2}>
              <Typography variant="h4" textAlign="center" color="error.main">
                {report.summary.failed}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Failed
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Storage Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Storage Statistics
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="h5" textAlign="center">
                {report.storage.chaptersUploaded.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Chapters Uploaded
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h5" textAlign="center">
                {report.storage.coversUploaded}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Covers Uploaded
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h5" textAlign="center">
                {formatBytes(report.storage.totalSize)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Total Size
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Related Data Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Related Data Statistics
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Authors
              </Typography>
              <Typography variant="body2">
                Created: {report.relatedData.authors.created}, Updated: {report.relatedData.authors.updated}
              </Typography>
              <Typography variant="body2">
                Quotes: {report.relatedData.authors.quotes}, Timeline: {report.relatedData.authors.timelineEvents}
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Categories
              </Typography>
              <Typography variant="body2">
                Book-Category: {report.relatedData.categories.bookCategories}
              </Typography>
              <Typography variant="body2">
                Updated: {report.relatedData.categories.categoriesUpdated}
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Book Stats/Scores
              </Typography>
              <Typography variant="body2">
                Stats: {report.relatedData.bookStats.created}, Scores: {report.relatedData.bookStats.scores}
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Content
              </Typography>
              <Typography variant="body2">
                Context: {report.relatedData.content.bookContexts}, Guides: {report.relatedData.content.readingGuides}
              </Typography>
              <Typography variant="body2">
                Quotes: {report.relatedData.content.quotes}
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Characters
              </Typography>
              <Typography variant="body2">
                Characters: {report.relatedData.characters.characters}, Relations: {report.relatedData.characters.relationships}
              </Typography>
              <Typography variant="body2">
                Graphs: {report.relatedData.characters.graphs}, Events: {report.relatedData.characters.events}
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Agora / BookLists
              </Typography>
              <Typography variant="body2">
                Posts: {report.relatedData.agora.posts}
              </Typography>
              <Typography variant="body2">
                Lists: {report.relatedData.bookLists.created}, Items: {report.relatedData.bookLists.items}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Health Check */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Health Check
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
              icon={report.healthCheck.apiHealth ? <CheckCircleIcon /> : <ErrorIcon />}
              label="API Health"
              color={report.healthCheck.apiHealth ? 'success' : 'error'}
              size="small"
            />
            <Chip
              icon={report.healthCheck.sampleVerification ? <CheckCircleIcon /> : <ErrorIcon />}
              label="Sample Verification"
              color={report.healthCheck.sampleVerification ? 'success' : 'error'}
              size="small"
            />
          </Box>

          {report.healthCheck.issues.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="error">
                Issues:
              </Typography>
              <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                {report.healthCheck.issues.map((issue, idx) => (
                  <li key={idx}>
                    <Typography variant="caption">{issue}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Failures */}
      {report.failures.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom color="error">
              Failed Books ({report.failures.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Stage</TableCell>
                    <TableCell>Error</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.failures.map((f, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography variant="body2">{f.book.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {f.book.author}
                        </Typography>
                      </TableCell>
                      <TableCell>{f.stage}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="error">
                          {f.error}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* API Endpoint */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            API Endpoint
          </Typography>
          <Link href={report.apiEndpoint} target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {report.apiEndpoint}
            <OpenInNewIcon fontSize="small" />
          </Link>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          {translate('pipeline.exportReport', { _: 'Export Report' })}
        </Button>
        <Button variant="contained" onClick={onReset}>
          {translate('pipeline.startNew', { _: 'Start New Pipeline' })}
        </Button>
      </Box>
    </Box>
  );
}
