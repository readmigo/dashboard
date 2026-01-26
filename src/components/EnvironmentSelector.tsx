import { useState } from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useRefresh, useTranslate } from 'react-admin';
import { useEnvironment, Environment } from '../contexts/EnvironmentContext';

export const EnvironmentSelector = () => {
  const { environment, setEnvironment } = useEnvironment();
  const refresh = useRefresh();
  const translate = useTranslate();
  const [pendingEnv, setPendingEnv] = useState<Environment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChange = (_: React.MouseEvent<HTMLElement>, newEnv: Environment | null) => {
    if (newEnv && newEnv !== environment) {
      if (newEnv === 'production') {
        // Show confirmation dialog for production
        setPendingEnv(newEnv);
        setDialogOpen(true);
      } else {
        setEnvironment(newEnv);
        // Trigger refresh to reload data from new environment
        setTimeout(() => refresh(), 100);
      }
    }
  };

  const handleConfirmProduction = () => {
    if (pendingEnv) {
      setEnvironment(pendingEnv);
      // Trigger refresh to reload data from new environment
      setTimeout(() => refresh(), 100);
    }
    setDialogOpen(false);
    setPendingEnv(null);
  };

  const handleCancelProduction = () => {
    setDialogOpen(false);
    setPendingEnv(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
        >
          {translate('environment.label')}
        </Typography>
        <ToggleButtonGroup
          value={environment}
          exclusive
          onChange={handleChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
              textTransform: 'none',
              borderColor: 'divider',
              '&.Mui-selected': {
                backgroundColor:
                  environment === 'local'
                    ? 'warning.main'
                    : 'success.main',
                color: 'white',
                '&:hover': {
                  backgroundColor:
                    environment === 'local'
                      ? 'warning.dark'
                      : 'success.dark',
                },
              },
            },
          }}
        >
          <ToggleButton value="local">{translate('environment.local.label')}</ToggleButton>
          <ToggleButton value="production">{translate('environment.production.label')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCancelProduction}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          {translate('environment.switchDialog.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translate('environment.switchDialog.message')}
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.contrastText">
              {translate('environment.switchDialog.warning')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelProduction} color="inherit">
            {translate('environment.switchDialog.cancel')}
          </Button>
          <Button onClick={handleConfirmProduction} color="error" variant="contained">
            {translate('environment.switchDialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
