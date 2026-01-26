import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SyncIcon from '@mui/icons-material/Sync';
import { useState } from 'react';
import { BookStatus } from '../hooks/usePipelineStatus';

interface BookStatusListProps {
  books: BookStatus[];
}

const statusConfig: Record<
  string,
  { icon: React.ReactNode; color: 'success' | 'error' | 'warning' | 'info' | 'default' }
> = {
  completed: { icon: <CheckCircleIcon color="success" />, color: 'success' },
  failed: { icon: <ErrorIcon color="error" />, color: 'error' },
  skipped: { icon: <SkipNextIcon color="info" />, color: 'info' },
  pending: { icon: <HourglassEmptyIcon color="disabled" />, color: 'default' },
  matching: { icon: <SyncIcon color="primary" />, color: 'warning' },
  downloading: { icon: <SyncIcon color="primary" />, color: 'warning' },
  processing: { icon: <SyncIcon color="primary" />, color: 'warning' },
  uploading: { icon: <SyncIcon color="primary" />, color: 'warning' },
};

export function BookStatusList({ books }: BookStatusListProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredBooks = filter === 'all' ? books : books.filter((b) => b.status === filter);

  const statusCounts = books.reduce(
    (acc, book) => {
      acc[book.status] = (acc[book.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2">Book Processing List</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select value={filter} label="Filter" onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="all">All ({books.length})</MenuItem>
            {Object.entries(statusCounts).map(([status, count]) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
        <List dense>
          {filteredBooks.length === 0 ? (
            <ListItem>
              <ListItemText primary="No books to display" />
            </ListItem>
          ) : (
            filteredBooks.map((book, idx) => {
              const config = statusConfig[book.status] || statusConfig.pending;
              return (
                <ListItem
                  key={idx}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {book.chaptersCount && (
                        <Typography variant="caption" color="text.secondary">
                          {book.chaptersCount} chapters
                        </Typography>
                      )}
                      <Chip label={book.status} size="small" color={config.color} />
                    </Box>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{config.icon}</ListItemIcon>
                  <ListItemText
                    primary={book.title}
                    secondary={
                      <Box component="span">
                        <Typography component="span" variant="caption" color="text.secondary">
                          {book.author}
                        </Typography>
                        {book.error && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="error"
                            sx={{ ml: 1 }}
                          >
                            Error: {book.error}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              );
            })
          )}
        </List>
      </Paper>
    </Box>
  );
}
