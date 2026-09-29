/**
 * Colour tokens. Screens never hard-code colours: they read the active palette
 * from ThemeContext (useTheme / useThemedStyles), so light and dark modes stay in sync.
 */
export const LIGHT_COLORS = {
  // Brand greens
  primary: '#0E6B4A',
  primaryDark: '#0A4F37',
  primaryLight: '#3C9A73',

  // Gold accents
  gold: '#D4AF37',
  goldDark: '#9A7516',
  goldLight: '#F4E7C0',

  // Backgrounds
  background: '#F6F5F0',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEDE6',

  // Text
  text: '#1B1C1A',
  textSecondary: '#5E625C',
  textLight: '#FFFFFF',
  /** Text drawn on gold fills (identical in both modes). */
  onGold: '#1B1C1A',
  /** Secondary text on the green primary fill (headers, hero cards). */
  onPrimaryMuted: '#F4E7C0',
  /** Text on goldLight tinted backgrounds. */
  onGoldLight: '#0A4F37',

  // Status
  success: '#2E7D32',
  warning: '#B26A00',
  error: '#C62828',
  info: '#1565C0',

  // Tinted backgrounds for status / highlighted cards
  successBg: '#E8F5E9',
  warningBg: '#FFF3E0',
  goldBg: '#FFF8E6',

  // Lines
  border: '#E3E1D9',
  divider: '#CFCCC2',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
};

export type Palette = typeof LIGHT_COLORS;

export const DARK_COLORS: Palette = {
  primary: '#2E9A6E',
  primaryDark: '#1F6E4F',
  primaryLight: '#5FC49B',

  gold: '#D9B65C',
  goldDark: '#E3C27A',
  goldLight: '#3A3222',

  background: '#101311',
  surface: '#1A1E1B',
  surfaceAlt: '#242925',

  text: '#EEF0EC',
  textSecondary: '#A9AFA8',
  textLight: '#FFFFFF',
  onGold: '#1B1C1A',
  onPrimaryMuted: '#F4E7C0',
  onGoldLight: '#E3C27A',

  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
  info: '#64B5F6',

  successBg: '#173222',
  warningBg: '#3A2A12',
  goldBg: '#2A2616',

  border: '#2E3430',
  divider: '#3D443F',

  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowDark: 'rgba(0, 0, 0, 0.6)',
};

/** @deprecated Static light palette, kept for non-React code. Use useTheme() in components. */
export const COLORS = LIGHT_COLORS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  small: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 26,
  },
  medium: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 26,
    xxxl: 32,
  },
  large: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 22,
    xl: 26,
    xxl: 32,
    xxxl: 38,
  },
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 22,
  round: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const KAABA_LOCATION = {
  latitude: 21.422487,
  longitude: 39.826206,
};