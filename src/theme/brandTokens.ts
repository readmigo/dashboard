/**
 * Readmigo Brand Design Tokens
 * Source: docs/02-design/design-system.md
 *
 * All brand colors, semantic colors, and design tokens centralized here.
 * Import from this file instead of hardcoding hex values.
 */

// Brand Gradient
export const gradients = {
  brand: 'linear-gradient(135deg, #8BB9FF 0%, #B9B3F5 50%, #F6B6E8 100%)',
  brandHover: 'linear-gradient(135deg, #7AABFF 0%, #A8A2E6 50%, #E5A5D7 100%)',
} as const;

// Brand Colors
export const brandColors = {
  primary: '#7C8DF5',
  primaryLight: '#9A8CF2',
  primaryDark: '#6B7BE3',
  blue: '#8BB9FF',
  purple: '#B9B3F5',
  pink: '#F6B6E8',
  accentPurple: '#9A8CF2',
  accentPink: '#F3A6DC',
  accentBlue: '#A5C7FF',
  achievementGold: '#FFD36A',
} as const;

// Semantic Colors
export const semanticColors = {
  success: '#6ED6A8',
  warning: '#FFC26A',
  error: '#FF6B6B',
  info: '#7BAAFF',
} as const;

// Text Colors
export const textColors = {
  primary: '#2D2E4A',
  secondary: '#6B6F9C',
  hint: '#A3A6C8',
  onDark: '#FFFFFF',
} as const;

// Background Colors
export const bgColors = {
  light: '#F7F8FD',
  card: '#FFFFFF',
  subtle: '#EEF0FA',
} as const;

// Gray Scale (from design system)
export const grays = {
  50: '#FAFAFA',
  100: '#F4F4F5',
  200: '#E4E4E7',
  300: '#D4D4D8',
  400: '#A1A1AA',
  500: '#71717A',
  600: '#52525B',
  700: '#3F3F46',
  800: '#27272A',
  900: '#18181B',
} as const;

// Chart color palette (consistent order for Recharts)
export const chartPalette = [
  '#6ED6A8',  // success green
  '#8BB9FF',  // brand blue
  '#B9B3F5',  // brand purple
  '#FFD36A',  // gold
  '#F6B6E8',  // brand pink
  '#7C8DF5',  // primary
  '#F3A6DC',  // accent pink
  '#A5C7FF',  // accent blue
  '#FFC26A',  // warning
  '#9A8CF2',  // accent purple
] as const;

// Shadows (from design system)
export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
  lg: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
  xl: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
  brand: '0 2px 8px rgba(139, 185, 255, 0.3)',
  brandHover: '0 4px 12px rgba(139, 185, 255, 0.4)',
} as const;

// Border Radius (from design system)
export const radii = {
  sm: 4,
  md: 6,
  default: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// Alpha helpers
export const alpha = (hex: string, opacity: number): string => {
  const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${opacityHex}`;
};
