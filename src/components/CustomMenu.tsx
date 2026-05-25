import { Fragment } from 'react';
import { Menu, MenuItemLink, useSidebarState, useTranslate } from 'react-admin';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Divider, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { gradients, textColors } from '@/theme/brandTokens';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { navItems, type NavItem, type NavSection } from '@/app/navigation';

const SECTION_ORDER: NavSection[] = ['main', 'operations', 'support'];

const SECTION_HEADER_KEY: Partial<Record<NavSection, string>> = {
  operations: 'sidebar.sections.operations',
  support: 'sidebar.sections.support',
};

const sectionLabelSx = {
  px: 2,
  py: 0.5,
  color: textColors.secondary,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
} as const;

export const CustomMenu = () => {
  const location = useLocation();
  const [open] = useSidebarState();
  const translate = useTranslate();
  const { config } = useEnvironment();

  const label = (item: NavItem) =>
    item.labelFallback
      ? translate(item.labelKey, { _: item.labelFallback })
      : translate(item.labelKey);

  const renderItem = (item: NavItem) => {
    if (item.kind === 'external') {
      return (
        <ListItemButton
          key={item.path}
          component="a"
          href={item.href(config)}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingTop: '6px',
            paddingBottom: '6px',
            minHeight: 44,
            color: 'text.secondary',
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <item.Icon />
          </ListItemIcon>
          {open && (
            <ListItemText
              primary={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  {label(item)}
                  <OpenInNewIcon sx={{ fontSize: 12, ml: 0.5, opacity: 0.7 }} />
                </Box>
              }
            />
          )}
        </ListItemButton>
      );
    }

    const selected =
      item.kind === 'dashboard'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path);

    return (
      <MenuItemLink
        key={item.path}
        to={item.path}
        primaryText={label(item)}
        leftIcon={<item.Icon />}
        selected={selected}
        sidebarIsOpen={open}
      />
    );
  };

  return (
    <Menu>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-start' : 'center',
          px: open ? 2 : 1,
          py: 2,
          mb: 1,
        }}
      >
        <Box
          component="img"
          src="/app-icon.png"
          alt="Readmigo"
          sx={{ width: 36, height: 36, borderRadius: '8px' }}
        />
        {open && (
          <Typography
            variant="h6"
            sx={{
              ml: 1.5,
              fontWeight: 700,
              background: gradients.brand,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Readmigo
          </Typography>
        )}
      </Box>
      <Divider sx={{ mb: 1, mx: 2 }} />

      {SECTION_ORDER.map((section, index) => {
        const items = navItems.filter((item) => item.section === section);
        if (items.length === 0) return null;
        const headerKey = SECTION_HEADER_KEY[section];
        return (
          <Fragment key={section}>
            {index > 0 && <Divider sx={{ my: 1, mx: 2 }} />}
            {open && headerKey && (
              <Typography variant="caption" sx={sectionLabelSx}>
                {translate(headerKey)}
              </Typography>
            )}
            {items.map(renderItem)}
          </Fragment>
        );
      })}
    </Menu>
  );
};
