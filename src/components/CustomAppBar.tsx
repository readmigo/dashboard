import { AppBar, TitlePortal } from 'react-admin';
import { Box } from '@mui/material';
import { EnvironmentContentSelector } from './EnvironmentContentSelector';
import { TimezoneSelector } from './TimezoneSelector';
import { HelpButton } from './HelpButton';

export const CustomAppBar = () => (
  <AppBar>
    <TitlePortal />
    <Box sx={{ flex: 1 }} />
    <TimezoneSelector />
    <EnvironmentContentSelector />
    <HelpButton />
  </AppBar>
);
