import { ToggleButton, ToggleButtonGroup, Box, Typography } from '@mui/material';
import { useRefresh, useTranslate } from 'react-admin';
import { useContentLanguage, ContentLanguage } from '../contexts/ContentLanguageContext';

export const ContentLanguageSwitch = () => {
  const { contentLanguage, setContentLanguage } = useContentLanguage();
  const refresh = useRefresh();
  const translate = useTranslate();

  const handleChange = (_: React.MouseEvent<HTMLElement>, newLang: ContentLanguage | null) => {
    if (newLang && newLang !== contentLanguage) {
      setContentLanguage(newLang);
      // Trigger refresh to reload data with new content filter
      setTimeout(() => refresh(), 100);
    }
  };

  const getSelectedColor = () => {
    switch (contentLanguage) {
      case 'all':
        return 'secondary.main';
      case 'en':
        return 'primary.main';
      case 'zh':
        return 'error.main';
    }
  };

  const getSelectedHoverColor = () => {
    switch (contentLanguage) {
      case 'all':
        return 'secondary.dark';
      case 'en':
        return 'primary.dark';
      case 'zh':
        return 'error.dark';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
      >
        {translate('contentFilter.label')}
      </Typography>
      <ToggleButtonGroup
        value={contentLanguage}
        exclusive
        onChange={handleChange}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            px: 1.5,
            py: 0.5,
            fontSize: '0.8rem',
            textTransform: 'none',
            borderColor: 'divider',
            '&.Mui-selected': {
              backgroundColor: getSelectedColor(),
              color: 'white',
              '&:hover': {
                backgroundColor: getSelectedHoverColor(),
              },
            },
          },
        }}
      >
        <ToggleButton value="all">
          {translate('contentFilter.all')}
        </ToggleButton>
        <ToggleButton value="en">
          {translate('contentFilter.en')}
        </ToggleButton>
        <ToggleButton value="zh">
          {translate('contentFilter.zh')}
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
