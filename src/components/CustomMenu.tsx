import { Menu, MenuItemLink, useSidebarState, useTranslate } from 'react-admin';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Divider, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import BookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CategoryIcon from '@mui/icons-material/Category';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ImageIcon from '@mui/icons-material/Image';
import StyleIcon from '@mui/icons-material/Style';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FlagIcon from '@mui/icons-material/Flag';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MailIcon from '@mui/icons-material/Mail';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import GroupIcon from '@mui/icons-material/Group';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import RateReviewIcon from '@mui/icons-material/RateReview';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export const CustomMenu = () => {
  const location = useLocation();
  const [open] = useSidebarState();
  const translate = useTranslate();

  const isSelected = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Menu>
      {/* Logo Section */}
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
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #8BB9FF 0%, #B9B3F5 50%, #F6B6E8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(139, 185, 255, 0.3)',
          }}
        >
          <AutoStoriesIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        {open && (
          <Typography
            variant="h6"
            sx={{
              ml: 1.5,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8BB9FF 0%, #B9B3F5 50%, #F6B6E8 100%)',
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
      <MenuItemLink
        to="/"
        primaryText={translate('sidebar.dashboard')}
        leftIcon={<DashboardIcon />}
        selected={location.pathname === '/'}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/books"
        primaryText={translate('sidebar.books')}
        leftIcon={<BookIcon />}
        selected={isSelected('/books')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/authors"
        primaryText={translate('sidebar.authors')}
        leftIcon={<PersonIcon />}
        selected={isSelected('/authors')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/booklists"
        primaryText={translate('sidebar.bookLists')}
        leftIcon={<ListAltIcon />}
        selected={isSelected('/booklists')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/categories"
        primaryText={translate('sidebar.categories')}
        leftIcon={<CategoryIcon />}
        selected={isSelected('/categories')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/users"
        primaryText={translate('sidebar.users')}
        leftIcon={<PeopleIcon />}
        selected={isSelected('/users')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/quotes"
        primaryText={translate('sidebar.quotes')}
        leftIcon={<FormatQuoteIcon />}
        selected={isSelected('/quotes')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/postcard-templates"
        primaryText={translate('sidebar.postcardTemplates')}
        leftIcon={<StyleIcon />}
        selected={isSelected('/postcard-templates')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/postcards"
        primaryText={translate('sidebar.postcards')}
        leftIcon={<ImageIcon />}
        selected={isSelected('/postcards')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/feature-flags"
        primaryText={translate('sidebar.featureFlags')}
        leftIcon={<FlagIcon />}
        selected={isSelected('/feature-flags')}
        sidebarIsOpen={open}
      />
      <Divider sx={{ my: 1, mx: 2 }} />
      {open && (
        <Typography
          variant="caption"
          sx={{ px: 2, py: 0.5, color: 'text.secondary', fontWeight: 600 }}
        >
          {translate('sidebar.sections.operations')}
        </Typography>
      )}
      <MenuItemLink
        to="/operations"
        primaryText={translate('sidebar.operations.overview')}
        leftIcon={<TrendingUpIcon />}
        selected={isSelected('/operations')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/performance"
        primaryText={translate('sidebar.operations.performance')}
        leftIcon={<SpeedIcon />}
        selected={isSelected('/performance')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/reading-stats"
        primaryText={translate('sidebar.operations.readingStats')}
        leftIcon={<BarChartIcon />}
        selected={isSelected('/reading-stats')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/retention"
        primaryText={translate('sidebar.operations.retention')}
        leftIcon={<PeopleAltIcon />}
        selected={isSelected('/retention')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/demographics"
        primaryText={translate('sidebar.operations.demographics')}
        leftIcon={<GroupIcon />}
        selected={isSelected('/demographics')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/pipeline"
        primaryText={translate('sidebar.operations.pipeline', { _: 'Pipeline' })}
        leftIcon={<BuildCircleIcon />}
        selected={isSelected('/pipeline')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/se-import"
        primaryText={translate('sidebar.operations.seImport', { _: 'SE Import' })}
        leftIcon={<CloudDownloadIcon />}
        selected={isSelected('/se-import')}
        sidebarIsOpen={open}
      />
      {/* Content Studio - External Link */}
      <ListItemButton
        component="a"
        href="http://localhost:3002"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingTop: '6px',
          paddingBottom: '6px',
          minHeight: 44,
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
          <RateReviewIcon />
        </ListItemIcon>
        {open && (
          <>
            <ListItemText
              primary={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  {translate('sidebar.operations.contentStudio', { _: 'Content Studio' })}
                  <OpenInNewIcon sx={{ fontSize: 12, ml: 0.5, opacity: 0.7 }} />
                </Box>
              }
            />
          </>
        )}
      </ListItemButton>
      <Divider sx={{ my: 1, mx: 2 }} />
      {open && (
        <Typography
          variant="caption"
          sx={{ px: 2, py: 0.5, color: 'text.secondary', fontWeight: 600 }}
        >
          {translate('sidebar.sections.support')}
        </Typography>
      )}
      <MenuItemLink
        to="/support-dashboard"
        primaryText={translate('sidebar.support.overview')}
        leftIcon={<SupportAgentIcon />}
        selected={isSelected('/support-dashboard')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/tickets"
        primaryText={translate('sidebar.support.tickets')}
        leftIcon={<ConfirmationNumberIcon />}
        selected={isSelected('/tickets')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/feedback"
        primaryText={translate('sidebar.support.feedback')}
        leftIcon={<FeedbackIcon />}
        selected={isSelected('/feedback')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/guest-feedback"
        primaryText={translate('sidebar.support.guestFeedback')}
        leftIcon={<ContactSupportIcon />}
        selected={isSelected('/guest-feedback')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/orders"
        primaryText={translate('sidebar.support.orders')}
        leftIcon={<ShoppingCartIcon />}
        selected={isSelected('/orders')}
        sidebarIsOpen={open}
      />
      <MenuItemLink
        to="/messages"
        primaryText={translate('sidebar.support.messages')}
        leftIcon={<MailIcon />}
        selected={isSelected('/messages')}
        sidebarIsOpen={open}
      />
    </Menu>
  );
};
