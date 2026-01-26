import { useLocaleState, useTranslate } from 'react-admin';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useState } from 'react';
import { SupportedLocale, setStoredLocale } from '../i18n';

const languages: { locale: SupportedLocale; name: string; flag: string }[] = [
  { locale: 'en', name: 'English', flag: '🇺🇸' },
  { locale: 'zh-Hans', name: '简体中文', flag: '🇨🇳' },
];

export const LanguageSwitcher = () => {
  const [locale, setLocale] = useLocaleState();
  const translate = useTranslate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    setStoredLocale(newLocale);
    handleClose();
  };

  return (
    <>
      <Tooltip title={translate('language.name')}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="language-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.locale}
            onClick={() => handleLanguageChange(language.locale)}
            selected={locale === language.locale}
          >
            <span style={{ marginRight: 8 }}>{language.flag}</span>
            {language.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
