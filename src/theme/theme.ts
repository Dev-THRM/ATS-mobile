import { Platform } from 'react-native';

export const COLORS = {
  // THRM Universe Signature London Blue (#005C82)
  primary: '#005C82',
  primaryHover: '#004766',
  primaryLight: '#E8F3FA',
  primaryLighter: '#F2F8FC',
  primaryDark: '#003B54',

  // Secondary Accents & Tones
  accent: '#005C82',
  accentLight: '#E8F3FA',
  londonBlue: '#005C82',
  londonBlueDark: '#004766',
  londonBlueDeep: '#002D42',
  londonBlueLight: '#E8F3FA',
  londonBlueSky: '#BAE6FD',
  teal: '#0D9488',
  tealLight: '#F0FDFA',

  // Status & Feedback
  success: '#059669', // Emerald 600
  successLight: '#ECFDF5',
  warning: '#D97706', // Amber 600
  warningLight: '#FFFBEB',
  error: '#DC2626', // Red 600
  errorLight: '#FEF2F2',
  info: '#005C82',
  infoLight: '#E8F3FA',

  // Surfaces & Backgrounds
  background: '#F4F9FD',
  surface: '#FFFFFF',
  surfaceSecondary: '#E8F3FA',
  surfaceTertiary: '#E2E8F0',
  surfaceCard: '#FFFFFF',

  // Text Hierarchy
  textPrimary: '#002D42', // Deep London Blue navy
  textSecondary: '#475569',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderSky: '#BAE6FD',
  borderFocus: '#005C82',
};

export const FONTS = {
  family: Platform.select({
    web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    ios: 'Inter',
    android: 'Inter',
    default: 'Inter',
  }),
  heading: Platform.select({
    web: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
    ios: 'PlusJakartaSans',
    android: 'PlusJakartaSans',
    default: 'PlusJakartaSans',
  }),
  // Custom fonts on Android TextInput trigger a native EditText rendering bug where typed text is invisible.
  // Using system font on Android ensures typed text is always crisp, opaque, and visible.
  input: Platform.select({
    ios: 'Inter',
    android: undefined,
    default: undefined,
  }),
};

export const SHADOWS = {
  none: {},
  sm: Platform.select({
    web: {
      boxShadow: '0 1px 3px 0 rgba(0, 92, 130, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    },
    default: {
      shadowColor: '#005C82',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
  }),
  md: Platform.select({
    web: {
      boxShadow: '0 4px 6px -1px rgba(0, 92, 130, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
    },
    default: {
      shadowColor: '#005C82',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
  }),
  lg: Platform.select({
    web: {
      boxShadow: '0 10px 15px -3px rgba(0, 92, 130, 0.12), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
    },
    default: {
      shadowColor: '#005C82',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 10,
      elevation: 5,
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

