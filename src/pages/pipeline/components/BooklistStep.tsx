import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Breadcrumbs,
  Link,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslate } from 'react-admin';
import { useEnvironment } from '../../../contexts/EnvironmentContext';

interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modifiedAt?: string;
}

interface BrowseResult {
  currentPath: string;
  parentPath: string | null;
  entries: FileEntry[];
}

interface BooklistStepProps {
  selectedBooklist: string | null;
  onSelect: (path: string) => void;
}

export function BooklistStep({ selectedBooklist, onSelect }: BooklistStepProps) {
  const translate = useTranslate();
  const { apiBaseUrl } = useEnvironment();
  const [currentPath, setCurrentPath] = useState('');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDirectory = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${apiBaseUrl}/api/v1/admin/pipeline/browse?path=${encodeURIComponent(path)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Admin-Mode': 'true',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to browse: ${response.statusText}`);
      }
      const data: BrowseResult = await response.json();
      setCurrentPath(data.currentPath);
      setEntries(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchDirectory('');
  }, [fetchDirectory]);

  const handleEntryClick = (entry: FileEntry) => {
    if (entry.isDirectory) {
      fetchDirectory(entry.path);
    } else if (entry.name.endsWith('.json')) {
      onSelect(entry.path);
    }
  };

  const handleBreadcrumbClick = (pathIndex: number) => {
    if (pathIndex === -1) {
      fetchDirectory('');
    } else {
      const parts = currentPath.split('/');
      const newPath = parts.slice(0, pathIndex + 1).join('/');
      fetchDirectory(newPath);
    }
  };

  const pathParts = currentPath ? currentPath.split('/') : [];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {translate('pipeline.selectBooklist', { _: 'Select Booklist File' })}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {translate('pipeline.booklistDescription', {
          _: 'Browse and select a JSON booklist file',
        })}
      </Typography>

      {selectedBooklist && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Selected: <strong>{selectedBooklist}</strong>
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        {/* Breadcrumb navigation */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color={currentPath === '' ? 'text.primary' : 'inherit'}
            onClick={() => handleBreadcrumbClick(-1)}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
            booklists
          </Link>
          {pathParts.map((part, idx) => (
            <Link
              key={idx}
              component="button"
              underline="hover"
              color={idx === pathParts.length - 1 ? 'text.primary' : 'inherit'}
              onClick={() => handleBreadcrumbClick(idx)}
              sx={{ cursor: 'pointer' }}
            >
              {part}
            </Link>
          ))}
        </Breadcrumbs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : entries.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            {translate('pipeline.emptyDirectory', { _: 'This directory is empty' })}
          </Typography>
        ) : (
          <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
            {entries.map((entry) => (
              <ListItemButton
                key={entry.path}
                onClick={() => handleEntryClick(entry)}
                selected={selectedBooklist === entry.path}
                disabled={!entry.isDirectory && !entry.name.endsWith('.json')}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {entry.isDirectory ? (
                    <FolderIcon color="warning" />
                  ) : (
                    <InsertDriveFileIcon
                      color={entry.name.endsWith('.json') ? 'primary' : 'disabled'}
                    />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={entry.name}
                  secondary={
                    !entry.isDirectory && entry.size
                      ? formatFileSize(entry.size)
                      : undefined
                  }
                />
                {entry.name.endsWith('.json') && !entry.isDirectory && (
                  <Chip label="JSON" size="small" color="primary" variant="outlined" />
                )}
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
