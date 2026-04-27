export const colors = {
  primary: '#0078D4',
  primaryDark: '#005A9E',
  primaryLight: '#C7E0F4',
  secondary: '#2B88D8',

  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  textInverse: '#FFFFFF',

  border: '#E0E0E0',
  divider: '#F0F0F0',

  success: '#107C10',
  warning: '#FFB900',
  error: '#D13438',
  info: '#0078D4',

  scope1: '#D13438',
  scope2: '#FFB900',
  scope3: '#107C10',

  overlay: 'rgba(0, 0, 0, 0.5)',
  skeleton: '#E8E8E8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const typography = {
  h1: {fontSize: 28, fontWeight: '700' as const, color: colors.text},
  h2: {fontSize: 22, fontWeight: '600' as const, color: colors.text},
  h3: {fontSize: 18, fontWeight: '600' as const, color: colors.text},
  body: {fontSize: 16, fontWeight: '400' as const, color: colors.text},
  bodySmall: {fontSize: 14, fontWeight: '400' as const, color: colors.textSecondary},
  caption: {fontSize: 12, fontWeight: '400' as const, color: colors.textLight},
  button: {fontSize: 16, fontWeight: '600' as const, color: colors.textInverse},
};
