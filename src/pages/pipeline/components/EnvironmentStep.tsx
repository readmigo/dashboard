import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import ApiIcon from '@mui/icons-material/Api';
import { useTranslate } from 'react-admin';

export type PipelineEnvironment = 'local' | 'production';

interface EnvironmentStepProps {
  selectedEnvironment: PipelineEnvironment | null;
  onSelect: (env: PipelineEnvironment) => void;
}

interface EnvironmentConfig {
  id: PipelineEnvironment;
  name: string;
  color: 'info' | 'success' | 'warning' | 'error';
  database: string;
  storage: string;
  api: string;
  warning?: string;
}

const environments: EnvironmentConfig[] = [
  {
    id: 'local',
    name: 'Local',
    color: 'info',
    database: 'Local PostgreSQL',
    storage: 'Local Filesystem',
    api: 'localhost:3000',
  },
  {
    id: 'production',
    name: 'Production',
    color: 'error',
    database: 'Neon Production',
    storage: 'R2 Production',
    api: 'api.readmigo.app',
    warning: 'Production environment - requires extra caution',
  },
];

export function EnvironmentStep({ selectedEnvironment, onSelect }: EnvironmentStepProps) {
  const translate = useTranslate();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {translate('pipeline.selectEnvironment', { _: 'Select Target Environment' })}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {translate('pipeline.environmentDescription', {
          _: 'Choose the environment where books will be imported',
        })}
      </Typography>

      <Grid container spacing={2}>
        {environments.map((env) => (
          <Grid item xs={12} sm={6} md={3} key={env.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedEnvironment === env.id ? 2 : 1,
                borderColor: selectedEnvironment === env.id ? `${env.color}.main` : 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: `${env.color}.main`,
                  boxShadow: 2,
                },
              }}
              onClick={() => onSelect(env.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={env.name}
                    color={env.color}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {selectedEnvironment === env.id && (
                    <Chip label="Selected" size="small" variant="outlined" />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StorageIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{env.database}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CloudIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{env.storage}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ApiIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {env.api}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedEnvironment === 'production' && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          {translate('pipeline.productionWarning', {
            _: 'You are about to modify the production environment. Please proceed with caution.',
          })}
        </Alert>
      )}
    </Box>
  );
}
