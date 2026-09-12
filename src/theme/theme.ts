import { Platform } from 'react-native';

export const COLORS = {
  // Light Blue & White Primary Brand
  primary: '#0284C7', // Sky 600
  primaryHover: '#0369A1', // Sky 700
  primaryLight: '#E0F2FE', // Sky 100
  primaryLighter: '#F0F9FF', // Sky 50
  primaryDark: '#075985', // Sky 800

  // Secondary Accents
  accent: '#2563EB', // Blue 600
  accentLight: '#EFF6FF', // Blue 50
  teal: '#0D9488',
  tealLight: '#F0FDFA',

  // Status & Feedback
  success: '#059669', // Emerald 600
  successLight: '#ECFDF5',
  warning: '#D97706', // Amber 600
  warningLight: '#FFFBEB',
  error: '#DC2626', // Red 600
  errorLight: '#FEF2F2',
  info: '#0284C7',
  infoLight: '#E0F2FE',

  // Surfaces & Backgrounds (Crisp Light Blue & White)
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F7FF', // Soft ice blue
  surfaceTertiary: '#E2E8F0',
  surfaceCard: '#FFFFFF',

  // Text Hierarchy (Clean, balanced contrast)
  textPrimary: '#1E293B', // Slate 800 (softer than harsh black)
  textSecondary: '#475569', // Slate 600
  textMuted: '#64748B', // Slate 500
  textLight: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderSky: '#BAE6FD', // Sky 200
  borderFocus: '#38BDF8', // Sky 400
};

export const FONTS = {
  family: Platform.select({
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    ios: 'System',
    android: 'Roboto',
    default: 'normal',
  }),
};

export const SHADOWS = {
  none: {},
  sm: Platform.select({
    web: {
      boxShadow: '0 1px 3px 0 rgba(14, 165, 233, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    },
    default: {
      shadowColor: '#0284C7',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
  }),
  md: Platform.select({
    web: {
      boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
    },
    default: {
      shadowColor: '#0284C7',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 5,
      elevation: 2,
    },
  }),
  lg: Platform.select({
    web: {
      boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
    },
    default: {
      shadowColor: '#0284C7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
  }),
};

export const RADIUS = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

