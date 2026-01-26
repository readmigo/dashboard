import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslate } from 'react-admin';

interface HelpContent {
  title: string;
  description: string;
  sections?: {
    title: string;
    content: React.ReactNode;
  }[];
}

const helpContents: Record<string, HelpContent> = {
  '/': {
    title: 'Dashboard Overview',
    description: 'The dashboard provides a quick overview of your content management system.',
    sections: [
      {
        title: 'Statistics Cards',
        content: (
          <Typography variant="body2">
            View key metrics including total books, users, AI interactions, and daily active users.
          </Typography>
        ),
      },
      {
        title: 'Charts',
        content: (
          <Typography variant="body2">
            Visual representations of reading activity, genre distribution, and difficulty levels.
          </Typography>
        ),
      },
    ],
  },
  '/books': {
    title: 'Books Management',
    description: 'Manage your book catalog, including metadata, difficulty levels, and publication status.',
    sections: [
      {
        title: 'Difficulty Fields',
        content: (
          <Box>
            <Typography variant="body2" paragraph>
              Books have multiple difficulty indicators to help users find appropriate reading material:
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell><strong>Field</strong></TableCell>
                    <TableCell><strong>Range</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Difficulty Score</TableCell>
                    <TableCell>0-100</TableCell>
                    <TableCell>Universal numeric score. Higher = more difficult</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>HSK Level</TableCell>
                    <TableCell>1-9</TableCell>
                    <TableCell>Chinese proficiency level (for Chinese books)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CEFR Level</TableCell>
                    <TableCell>A1-C2</TableCell>
                    <TableCell>European language framework (for English books)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="subtitle2" gutterBottom>HSK Levels Explained:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label="HSK 1-2: Beginner" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
              <Chip label="HSK 3-4: Elementary" size="small" sx={{ bgcolor: '#8bc34a', color: 'white' }} />
              <Chip label="HSK 5-6: Intermediate" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
              <Chip label="HSK 7-9: Advanced" size="small" sx={{ bgcolor: '#f44336', color: 'white' }} />
            </Box>
            <Typography variant="subtitle2" gutterBottom>CEFR Levels Explained:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="A1-A2: Basic" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
              <Chip label="B1-B2: Independent" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
              <Chip label="C1-C2: Proficient" size="small" sx={{ bgcolor: '#f44336', color: 'white' }} />
            </Box>
          </Box>
        ),
      },
      {
        title: 'Status',
        content: (
          <Box>
            <Typography variant="body2" paragraph>
              Book publication status controls visibility to end users:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="DRAFT" size="small" color="default" />
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>- Not visible to users, work in progress</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip label="PUBLISHED" size="small" color="success" />
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>- Visible and available to users</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip label="ARCHIVED" size="small" color="warning" />
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>- Hidden from new users, may still be accessible to existing readers</Typography>
            </Box>
          </Box>
        ),
      },
      {
        title: 'Source',
        content: (
          <Typography variant="body2">
            Indicates where the book content originated: <strong>GUTENBERG</strong> (Project Gutenberg public domain),
            <strong> CUSTOM</strong> (manually added), or <strong>IMPORT</strong> (bulk imported).
          </Typography>
        ),
      },
    ],
  },
  '/authors': {
    title: 'Authors Management',
    description: 'Manage author profiles, biographies, and associated metadata.',
    sections: [
      {
        title: 'Author Fields',
        content: (
          <Typography variant="body2">
            Each author can have a biography, nationality, literary period, birth/death years, and associated books.
            Authors can also have AI-generated chat personas for interactive features.
          </Typography>
        ),
      },
    ],
  },
  '/booklists': {
    title: 'Book Lists',
    description: 'Create and manage curated book collections.',
    sections: [
      {
        title: 'List Types',
        content: (
          <Typography variant="body2">
            Book lists can be curated collections, reading challenges, or thematic groupings.
            Items in a list can be reordered by drag-and-drop.
          </Typography>
        ),
      },
    ],
  },
  '/categories': {
    title: 'Categories',
    description: 'Manage the hierarchical category system for organizing books.',
    sections: [
      {
        title: 'Category Hierarchy',
        content: (
          <Typography variant="body2">
            Categories support up to 3 levels of nesting. Each category has a slug for URL routing,
            display names in multiple languages, and can have an icon.
          </Typography>
        ),
      },
    ],
  },
  '/users': {
    title: 'Users Management',
    description: 'View and manage user accounts.',
    sections: [
      {
        title: 'User Information',
        content: (
          <Typography variant="body2">
            View user profiles, reading statistics, subscription status, and account details.
            User data is read-only for privacy and security.
          </Typography>
        ),
      },
    ],
  },
  '/quotes': {
    title: 'Quotes Management',
    description: 'Manage literary quotes from books.',
    sections: [
      {
        title: 'Quote Fields',
        content: (
          <Typography variant="body2">
            Quotes include the text, source book, author, page/location, and optional tags.
            Quotes can be featured for display in the app.
          </Typography>
        ),
      },
    ],
  },
  '/ai-stats': {
    title: 'AI Statistics',
    description: 'Monitor AI usage and performance metrics.',
    sections: [
      {
        title: 'Metrics',
        content: (
          <Typography variant="body2">
            Track AI interactions including chat messages, translations, explanations, and other
            AI-powered features. Monitor usage patterns and costs.
          </Typography>
        ),
      },
    ],
  },
  '/feature-flags': {
    title: 'Feature Flags',
    description: 'Control feature rollouts and A/B testing.',
    sections: [
      {
        title: 'Flag Types',
        content: (
          <Typography variant="body2">
            Feature flags can be boolean (on/off), percentage-based (gradual rollout),
            or user-segment based. Use flags to safely deploy new features.
          </Typography>
        ),
      },
    ],
  },
};

const getHelpContent = (pathname: string): HelpContent => {
  // Check for exact match first
  if (helpContents[pathname]) {
    return helpContents[pathname];
  }

  // Check for prefix match (e.g., /books/123 should match /books)
  const basePath = '/' + pathname.split('/')[1];
  if (helpContents[basePath]) {
    return helpContents[basePath];
  }

  // Default help
  return {
    title: 'Help',
    description: 'Select a section from the menu to see context-specific help.',
  };
};

export const HelpButton = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const translate = useTranslate();
  const helpContent = getHelpContent(location.pathname);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={() => setOpen(true)}
        title={translate('help.title')}
        size="large"
      >
        <HelpOutlineIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpOutlineIcon color="primary" />
            <Typography variant="h6">{helpContent.title}</Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body1" paragraph color="text.secondary">
            {helpContent.description}
          </Typography>

          {helpContent.sections?.map((section, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {section.title}
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {section.content}
            </Box>
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>{translate('help.close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
