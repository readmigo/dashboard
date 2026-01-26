import { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Chip,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudIcon from '@mui/icons-material/Cloud';
import ComputerIcon from '@mui/icons-material/Computer';
import LanguageIcon from '@mui/icons-material/Language';
import PublishIcon from '@mui/icons-material/Publish';
import { useRefresh, useTranslate } from 'react-admin';
import { useEnvironment, Environment } from '../contexts/EnvironmentContext';
import { useContentLanguage, ContentLanguage } from '../contexts/ContentLanguageContext';

interface EnvironmentOption {
  value: Environment;
  labelKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  color: 'warning' | 'info' | 'success';
}

interface ContentOption {
  value: ContentLanguage;
  labelKey: string;
  descriptionKey: string;
}

const environmentOptions: EnvironmentOption[] = [
  {
    value: 'local',
    labelKey: 'environment.local.label',
    descriptionKey: 'environment.local.description',
    icon: <ComputerIcon fontSize="small" />,
    color: 'warning',
  },
  {
    value: 'production',
    labelKey: 'environment.production.label',
    descriptionKey: 'environment.production.description',
    icon: <CloudIcon fontSize="small" />,
    color: 'success',
  },
];

const contentOptions: ContentOption[] = [
  { value: 'all', labelKey: 'contentFilter.all', descriptionKey: 'contentFilter.all' },
  { value: 'en', labelKey: 'contentFilter.en', descriptionKey: 'contentFilter.en' },
  { value: 'zh', labelKey: 'contentFilter.zh', descriptionKey: 'contentFilter.zh' },
];

export const EnvironmentContentSelector = () => {
  const { environment, setEnvironment } = useEnvironment();
  const { contentLanguage, setContentLanguage } = useContentLanguage();
  const refresh = useRefresh();
  const translate = useTranslate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [prodDialogOpen, setProdDialogOpen] = useState(false);
  const [pendingEnv, setPendingEnv] = useState<Environment | null>(null);

  const open = Boolean(anchorEl);

  const currentEnvOption = environmentOptions.find((e) => e.value === environment)!;
  const currentContentOption = contentOptions.find((c) => c.value === contentLanguage)!;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEnvSelect = (env: Environment) => {
    if (env === 'production' && environment !== 'production') {
      setPendingEnv(env);
      setProdDialogOpen(true);
      handleClose();
    } else if (env !== environment) {
      setEnvironment(env);
      setTimeout(() => refresh(), 100);
    }
    handleClose();
  };

  const handleContentSelect = (content: ContentLanguage) => {
    if (content !== contentLanguage) {
      setContentLanguage(content);
      setTimeout(() => refresh(), 100);
    }
    handleClose();
  };

  const handleConfirmProduction = () => {
    if (pendingEnv) {
      setEnvironment(pendingEnv);
      setTimeout(() => refresh(), 100);
    }
    setProdDialogOpen(false);
    setPendingEnv(null);
  };

  const handleCancelProduction = () => {
    setProdDialogOpen(false);
    setPendingEnv(null);
  };

  // Determine if we're in a publishable mode (specific language, not 'all')
  const isPublishableMode = contentLanguage !== 'all';

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outlined"
        size="small"
        endIcon={<KeyboardArrowDownIcon sx={{ color: 'white' }} />}
        sx={{
          textTransform: 'none',
          borderColor: 'rgba(255,255,255,0.5)',
          color: 'white',
          minWidth: 200,
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.8)',
            bgcolor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={translate(currentEnvOption.labelKey)}
            size="small"
            color={currentEnvOption.color}
            sx={{ height: 22, fontSize: '0.75rem' }}
          />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            /
          </Typography>
          <Chip
            icon={<LanguageIcon sx={{ fontSize: 14, color: 'white !important' }} />}
            label={translate(currentContentOption.labelKey)}
            size="small"
            variant="outlined"
            sx={{
              height: 22,
              fontSize: '0.75rem',
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '& .MuiChip-icon': { color: 'white' },
            }}
          />
          {isPublishableMode && (
            <Chip
              icon={<PublishIcon sx={{ fontSize: 12, color: 'white !important' }} />}
              label={translate('contentFilter.editMode.label')}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: 'rgba(255,255,255,0.25)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' },
              }}
            />
          )}
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: { minWidth: 280, mt: 0.5 },
        }}
      >
        {/* Environment Section */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">
            {translate('environment.header')}
          </Typography>
        </Box>
        {environmentOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleEnvSelect(option.value)}
            selected={option.value === environment}
            sx={{ py: 1 }}
          >
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText
              primary={translate(option.labelKey)}
              secondary={translate(option.descriptionKey)}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            {option.value === environment && (
              <CheckCircleIcon color="primary" fontSize="small" />
            )}
          </MenuItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Content Section */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">
            {translate('contentFilter.header')}
          </Typography>
        </Box>
        {contentOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleContentSelect(option.value)}
            selected={option.value === contentLanguage}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              <LanguageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {translate(option.labelKey)}
                  {option.value !== 'all' && (
                    <Chip
                      label={translate('contentFilter.editMode.publishable')}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>
              }
              secondary={translate(option.descriptionKey)}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            {option.value === contentLanguage && (
              <CheckCircleIcon color="primary" fontSize="small" />
            )}
          </MenuItem>
        ))}

        {/* Publish Mode Info */}
        {isPublishableMode && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ px: 2, py: 1.5, bgcolor: 'secondary.light', borderRadius: 1, mx: 1, mb: 1 }}>
              <Typography variant="caption" color="secondary.contrastText">
                <strong>{translate('contentFilter.editMode.activated')}</strong>
              </Typography>
            </Box>
          </>
        )}
      </Menu>

      {/* Production Confirmation Dialog */}
      <Dialog open={prodDialogOpen} onClose={handleCancelProduction}>
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
