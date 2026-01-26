import { createTheme } from '@mui/material/styles';

// Readmigo Brand Colors from DESIGN_SYSTEM.md
const brandColors = {
  // Brand Gradient
  gradientStart: '#8BB9FF',   // Blue
  gradientMiddle: '#B9B3F5',  // Purple
  gradientEnd: '#F6B6E8',     // Pink

  // Primary Brand
  primary: '#7C8DF5',
  primaryLight: '#9A8CF2',    // Accent Purple
  primaryDark: '#6B7BE3',

  // Accent Colors
  accentPurple: '#9A8CF2',
  accentPink: '#F3A6DC',
  accentBlue: '#A5C7FF',
  achievementGold: '#FFD36A',

  // Text Colors
  textPrimary: '#2D2E4A',
  textSecondary: '#6B6F9C',
  textHint: '#A3A6C8',

  // Background Colors
  backgroundLight: '#F7F8FD',
  backgroundCard: '#FFFFFF',
  backgroundSubtle: '#EEF0FA',

  // Semantic Colors
  success: '#6ED6A8',
  warning: '#FFC26A',
  error: '#FF6B6B',
  info: '#7BAAFF',
};

export const readmigoTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.primary,
      light: brandColors.primaryLight,
      dark: brandColors.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.accentPink,
      light: brandColors.gradientEnd,
      dark: '#E896CC',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: brandColors.warning,
      contrastText: '#FFFFFF',
    },
    success: {
      main: brandColors.success,
      contrastText: '#FFFFFF',
    },
    error: {
      main: brandColors.error,
      contrastText: '#FFFFFF',
    },
    info: {
      main: brandColors.info,
      contrastText: '#FFFFFF',
    },
    background: {
      default: brandColors.backgroundLight,
      paper: brandColors.backgroundCard,
    },
    text: {
      primary: brandColors.textPrimary,
      secondary: brandColors.textSecondary,
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, color: brandColors.textPrimary },
    h2: { fontSize: '2rem', fontWeight: 600, color: brandColors.textPrimary },
    h3: { fontSize: '1.5rem', fontWeight: 600, color: brandColors.textPrimary },
    h4: { fontSize: '1.25rem', fontWeight: 600, color: brandColors.textPrimary },
    h5: { fontSize: '1.125rem', fontWeight: 600, color: brandColors.textPrimary },
    h6: { fontSize: '1rem', fontWeight: 600, color: brandColors.textPrimary },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(124, 141, 245, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(124, 141, 245, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(135deg, ${brandColors.gradientStart} 0%, ${brandColors.gradientMiddle} 50%, ${brandColors.gradientEnd} 100%)`,
          boxShadow: '0 2px 8px rgba(139, 185, 255, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: brandColors.backgroundCard,
          borderRight: `1px solid ${brandColors.backgroundSubtle}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: `${brandColors.primary}15`,
            color: brandColors.primary,
            '& .MuiListItemIcon-root': {
              color: brandColors.primary,
            },
            '&:hover': {
              backgroundColor: `${brandColors.primary}20`,
            },
          },
          '&:hover': {
            backgroundColor: brandColors.backgroundSubtle,
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: brandColors.textSecondary,
          minWidth: 40,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: brandColors.backgroundSubtle,
            fontWeight: 600,
            color: brandColors.textPrimary,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: `${brandColors.primary}08`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorPrimary: {
          backgroundColor: `${brandColors.primary}15`,
          color: brandColors.primary,
        },
        colorSecondary: {
          backgroundColor: `${brandColors.accentPink}15`,
          color: brandColors.accentPink,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary,
            },
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        primary: {
          backgroundImage: `linear-gradient(135deg, ${brandColors.gradientStart} 0%, ${brandColors.gradientMiddle} 50%, ${brandColors.gradientEnd} 100%)`,
          boxShadow: '0 4px 12px rgba(139, 185, 255, 0.4)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(139, 185, 255, 0.5)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: brandColors.backgroundSubtle,
        },
        bar: {
          borderRadius: 4,
          backgroundImage: `linear-gradient(135deg, ${brandColors.gradientStart} 0%, ${brandColors.gradientMiddle} 50%, ${brandColors.gradientEnd} 100%)`,
        },
      },
    },
  },
});

// Export brand colors for use in custom components
export { brandColors };
