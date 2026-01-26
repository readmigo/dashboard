import { FormControl, Select, MenuItem, SelectChangeEvent, Box, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useContentFilter, ContentFilter } from '../contexts/ContentContext';
import { contentFilterOptions } from '../config/environments';

export const ContentFilterSelector = () => {
  const { contentFilter, setContentFilter } = useContentFilter();

  const handleChange = (event: SelectChangeEvent) => {
    setContentFilter(event.target.value as ContentFilter);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LanguageIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <Select
          value={contentFilter}
          onChange={handleChange}
          variant="outlined"
          sx={{
            '& .MuiSelect-select': {
              py: 0.5,
              fontSize: '0.875rem',
            },
          }}
        >
          {contentFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Typography variant="body2">{option.label}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
