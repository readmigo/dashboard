import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  Divider,
  RadioGroup,
  Radio,
  FormLabel,
} from '@mui/material';
import { useTranslate } from 'react-admin';

export interface PipelineOptions {
  skipExisting: boolean;
  parallel: number;
  sourcePriority: 'AUTO' | 'STANDARD_EBOOKS' | 'GUTENBERG';
  processRelatedData: boolean;
}

interface OptionsStepProps {
  options: PipelineOptions;
  onChange: (options: PipelineOptions) => void;
}

export function OptionsStep({ options, onChange }: OptionsStepProps) {
  const translate = useTranslate();

  const handleChange = (key: keyof PipelineOptions, value: unknown) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {translate('pipeline.configureOptions', { _: 'Configure Import Options' })}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {translate('pipeline.optionsDescription', {
          _: 'Configure how books should be imported and processed',
        })}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Basic Options */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              {translate('pipeline.basicOptions', { _: 'Basic Options' })}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
              control={
                <Checkbox
                  checked={options.skipExisting}
                  onChange={(e) => handleChange('skipExisting', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    {translate('pipeline.skipExisting', { _: 'Skip existing books' })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {translate('pipeline.skipExistingHint', {
                      _: 'Books already in the database will be skipped',
                    })}
                  </Typography>
                </Box>
              }
              sx={{ mb: 2, alignItems: 'flex-start' }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={options.processRelatedData}
                  onChange={(e) => handleChange('processRelatedData', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    {translate('pipeline.processRelatedData', { _: 'Process related data' })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {translate('pipeline.processRelatedDataHint', {
                      _: 'Calculate author stats, categories, book scores, etc.',
                    })}
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              {translate('pipeline.advancedOptions', { _: 'Advanced Options' })}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="parallel-label">
                {translate('pipeline.parallel', { _: 'Parallel Processing' })}
              </InputLabel>
              <Select
                labelId="parallel-label"
                value={options.parallel}
                label={translate('pipeline.parallel', { _: 'Parallel Processing' })}
                onChange={(e) => handleChange('parallel', e.target.value)}
              >
                <MenuItem value={1}>1 (Sequential)</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3 (Recommended)</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={5}>5 (Maximum)</MenuItem>
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {translate('pipeline.parallelHint', {
                  _: 'Number of books to process simultaneously',
                })}
              </Typography>
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">
                {translate('pipeline.sourcePriority', { _: 'Source Priority' })}
              </FormLabel>
              <RadioGroup
                value={options.sourcePriority}
                onChange={(e) => handleChange('sourcePriority', e.target.value)}
              >
                <FormControlLabel
                  value="AUTO"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2">
                      {translate('pipeline.sourceAuto', {
                        _: 'Auto (Standard Ebooks preferred)',
                      })}
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="STANDARD_EBOOKS"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2">
                      {translate('pipeline.sourceStandardEbooks', {
                        _: 'Standard Ebooks only',
                      })}
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="GUTENBERG"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2">
                      {translate('pipeline.sourceGutenberg', { _: 'Project Gutenberg only' })}
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
