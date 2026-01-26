import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Title, useNotify, useTranslate } from 'react-admin';
import { useEnvironment, Environment } from '../../contexts/EnvironmentContext';
import {
  featureFlagsService,
  FeatureFlag,
} from '../../services/featureFlagsService';

const environmentColors: Record<Environment, 'warning' | 'secondary' | 'success'> = {
  local: 'warning',
  debugging: 'warning',
  staging: 'secondary',
  production: 'success',
};

export const FeatureFlagsList = () => {
  const { environment } = useEnvironment();
  const notify = useNotify();
  const translate = useTranslate();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyingFlag, setCopyingFlag] = useState<FeatureFlag | null>(null);
  const [targetEnv, setTargetEnv] = useState<Environment>('staging');

  const loadFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await featureFlagsService.getFlags(environment);
      setFlags(data);
    } catch {
      setError(translate('featureFlags.errors.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [environment]);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await featureFlagsService.updateFlag(flag.key, flag.environment as Environment, {
        isEnabled: !flag.isEnabled,
      });
      notify(translate('featureFlags.notifications.updated'), { type: 'success' });
      loadFlags();
    } catch {
      notify(translate('featureFlags.errors.failedToUpdate'), { type: 'error' });
    }
  };

  const handleEditClick = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setEditValue(JSON.stringify(flag.value, null, 2));
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingFlag) return;

    try {
      const parsedValue = JSON.parse(editValue);
      await featureFlagsService.updateFlag(
        editingFlag.key,
        editingFlag.environment as Environment,
        { value: parsedValue }
      );
      notify(translate('featureFlags.notifications.valueUpdated'), { type: 'success' });
      setEditDialogOpen(false);
      setEditingFlag(null);
      loadFlags();
    } catch (e) {
      if (e instanceof SyntaxError) {
        notify(translate('featureFlags.errors.invalidJson'), { type: 'error' });
      } else {
        notify(translate('featureFlags.errors.failedToUpdate'), { type: 'error' });
      }
    }
  };

  const handleCopyClick = (flag: FeatureFlag) => {
    setCopyingFlag(flag);
    // Set default target environment
    const envOrder: Environment[] = ['local', 'debugging', 'staging', 'production'];
    const currentIndex = envOrder.indexOf(flag.environment as Environment);
    setTargetEnv(envOrder[(currentIndex + 1) % 4]);
    setCopyDialogOpen(true);
  };

  const handleCopy = async () => {
    if (!copyingFlag) return;

    try {
      await featureFlagsService.copyFlag(
        copyingFlag.key,
        copyingFlag.environment as Environment,
        targetEnv
      );
      notify(translate('featureFlags.notifications.copied', { environment: targetEnv }), { type: 'success' });
      setCopyDialogOpen(false);
      setCopyingFlag(null);
      loadFlags();
    } catch {
      notify(translate('featureFlags.errors.failedToCopy'), { type: 'error' });
    }
  };

  const handleClearCache = async () => {
    try {
      await featureFlagsService.clearCache();
      notify(translate('featureFlags.notifications.cacheCleared'), { type: 'success' });
    } catch {
      notify(translate('featureFlags.errors.failedToClearCache'), { type: 'error' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <Title title={translate('featureFlags.title')} />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" component="h2">
              {translate('featureFlags.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {translate('featureFlags.subtitle.prefix')}{' '}
              <Chip
                label={environment}
                size="small"
                color={environmentColors[environment]}
              />{' '}
              {translate('featureFlags.subtitle.suffix')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadFlags}
              disabled={loading}
            >
              {translate('featureFlags.buttons.refresh')}
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={handleClearCache}
            >
              {translate('featureFlags.buttons.clearCache')}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{translate('featureFlags.columns.key')}</TableCell>
                  <TableCell>{translate('featureFlags.columns.status')}</TableCell>
                  <TableCell>{translate('featureFlags.columns.description')}</TableCell>
                  <TableCell>{translate('featureFlags.columns.value')}</TableCell>
                  <TableCell>{translate('featureFlags.columns.lastUpdated')}</TableCell>
                  <TableCell>{translate('featureFlags.columns.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {flag.key}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={flag.isEnabled}
                        onChange={() => handleToggle(flag)}
                        color={flag.isEnabled ? 'success' : 'default'}
                      />
                      <Typography variant="caption" color={flag.isEnabled ? 'success.main' : 'text.secondary'}>
                        {flag.isEnabled ? translate('featureFlags.status.enabled') : translate('featureFlags.status.disabled')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {flag.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 1,
                          bgcolor: 'grey.100',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          maxWidth: 300,
                          overflow: 'auto',
                        }}
                      >
                        {JSON.stringify(flag.value, null, 2)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDate(flag.updatedAt)}
                      </Typography>
                      {flag.updatedBy && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          by {flag.updatedBy}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={translate('featureFlags.tooltips.editValue')}>
                          <IconButton size="small" onClick={() => handleEditClick(flag)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={translate('featureFlags.tooltips.copyToEnvironment')}>
                          <IconButton size="small" onClick={() => handleCopyClick(flag)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {flags.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        {translate('featureFlags.noFlagsFound', { environment })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{translate('featureFlags.dialogs.edit.title', { key: editingFlag?.key })}</DialogTitle>
          <DialogContent>
            <TextField
              label={translate('featureFlags.dialogs.edit.valueLabel')}
              multiline
              rows={10}
              fullWidth
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              sx={{ mt: 1 }}
              InputProps={{
                sx: { fontFamily: 'monospace' },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>{translate('featureFlags.buttons.cancel')}</Button>
            <Button onClick={handleEditSave} variant="contained" color="primary">
              {translate('featureFlags.buttons.save')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Copy Dialog */}
        <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)}>
          <DialogTitle>{translate('featureFlags.dialogs.copy.title')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {translate('featureFlags.dialogs.copy.copyPrefix')} <strong>{copyingFlag?.key}</strong> {translate('featureFlags.dialogs.copy.from')}{' '}
              <Chip
                label={copyingFlag?.environment}
                size="small"
                color={environmentColors[copyingFlag?.environment as Environment] || 'default'}
              />{' '}
              {translate('featureFlags.dialogs.copy.to')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['local', 'debugging', 'staging', 'production'] as Environment[])
                .filter((env) => env !== copyingFlag?.environment)
                .map((env) => (
                  <Chip
                    key={env}
                    label={env}
                    color={targetEnv === env ? environmentColors[env] : 'default'}
                    variant={targetEnv === env ? 'filled' : 'outlined'}
                    onClick={() => setTargetEnv(env)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCopyDialogOpen(false)}>{translate('featureFlags.buttons.cancel')}</Button>
            <Button onClick={handleCopy} variant="contained" color="primary">
              {translate('featureFlags.buttons.copy')}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};
