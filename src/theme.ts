import { createTheme } from '@mui/material/styles';
import {
  brandColors,
  semanticColors,
  textColors,
  bgColors,
  grays,
  gradients,
  shadows,
  radii,
  alpha,
} from './theme/brandTokens';

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
      light: brandColors.pink,
      dark: '#E896CC',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: semanticColors.warning,
      contrastText: '#FFFFFF',
    },
    success: {
      main: semanticColors.success,
      contrastText: '#FFFFFF',
    },
    error: {
      main: semanticColors.error,
      contrastText: '#FFFFFF',
    },
    info: {
      main: semanticColors.info,
      contrastText: '#FFFFFF',
    },
    background: {
      default: bgColors.light,
      paper: bgColors.card,
    },
    text: {
      primary: textColors.primary,
      secondary: textColors.secondary,
    },
    grey: grays,
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '2.125rem', fontWeight: 700, lineHeight: 1.18 },
    h2: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.21 },
    h3: { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.27 },
    h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.25 },
    h5: { fontSize: '1.0625rem', fontWeight: 600, lineHeight: 1.29 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.375 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.33 },
    overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', lineHeight: 1.18 },
  },
  shape: {
    borderRadius: radii.default,
  },
  shadows: [
    'none',
    shadows.sm,
    shadows.md,
    shadows.lg,
    shadows.xl,
    // Fill remaining MUI shadow slots with xl
    ...Array(20).fill(shadows.xl),
  ] as unknown as typeof createTheme extends (o: infer O) => unknown ? O extends { shadows?: infer S } ? S : never : never,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          borderRadius: radii.default,
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
          boxShadow: shadows.lg,
          borderRadius: radii.lg,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: shadows.sm,
        },
        elevation2: {
          boxShadow: shadows.lg,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: gradients.brand,
          boxShadow: shadows.brand,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: bgColors.card,
          borderRight: `1px solid ${bgColors.subtle}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: radii.default,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha(brandColors.primary, 0.08),
            color: brandColors.primary,
            '& .MuiListItemIcon-root': {
              color: brandColors.primary,
            },
            '&:hover': {
              backgroundColor: alpha(brandColors.primary, 0.12),
            },
          },
          '&:hover': {
            backgroundColor: bgColors.subtle,
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: textColors.secondary,
          minWidth: 40,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: bgColors.subtle,
            fontWeight: 600,
            color: textColors.primary,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(brandColors.primary, 0.03),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radii.md,
        },
        colorPrimary: {
          backgroundColor: alpha(brandColors.primary, 0.08),
          color: brandColors.primary,
        },
        colorSecondary: {
          backgroundColor: alpha(brandColors.accentPink, 0.08),
          color: brandColors.accentPink,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: radii.default,
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
          backgroundImage: gradients.brand,
          boxShadow: shadows.brandHover,
          '&:hover': {
            boxShadow: '0 6px 16px rgba(139, 185, 255, 0.5)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: radii.sm,
          backgroundColor: bgColors.subtle,
        },
        bar: {
          borderRadius: radii.sm,
          backgroundImage: gradients.brand,
        },
      },
    },
  },
});

// Re-export brand tokens for backward compatibility
// Pages that already use `brandColors.xxx` get the full merged object
// New code should import granular tokens from `theme/brandTokens`
export const legacyBrandColors = {
  // Gradient
  gradientStart: brandColors.blue,
  gradientMiddle: brandColors.purple,
  gradientEnd: brandColors.pink,
  // Primary
  primary: brandColors.primary,
  primaryLight: brandColors.primaryLight,
  primaryDark: brandColors.primaryDark,
  // Accent
  accentPurple: brandColors.accentPurple,
  accentPink: brandColors.accentPink,
  accentBlue: brandColors.accentBlue,
  achievementGold: brandColors.achievementGold,
  // Text
  textPrimary: textColors.primary,
  textSecondary: textColors.secondary,
  textHint: textColors.hint,
  // Background
  backgroundLight: bgColors.light,
  backgroundCard: bgColors.card,
  backgroundSubtle: bgColors.subtle,
  // Semantic
  success: semanticColors.success,
  warning: semanticColors.warning,
  error: semanticColors.error,
  info: semanticColors.info,
};

export { legacyBrandColors as brandColors };
