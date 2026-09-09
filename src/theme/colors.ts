/**
 * CleanSwift palette — teal-forward, trustworthy, premium but approachable.
 */
export const colors = {
  // Brand
  primary: '#0E8A72',
  primaryDark: '#0A6B58',
  primaryLight: '#E6F4F1',

  // Accent (warm sand for highlights, ratings)
  accent: '#F4A63B',
  accentLight: '#FDF3E3',

  // Neutrals (ink scale)
  ink900: '#101828',
  ink700: '#344054',
  ink500: '#667085',
  ink400: '#98A2B3',
  ink300: '#D0D5DD',
  ink200: '#EAECF0',
  ink100: '#F2F4F7',
  ink50: '#F9FAFB',

  // Surfaces
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F7F9F9',

  // Semantic
  success: '#12B76A',
  successLight: '#E7F8F0',
  warning: '#F79009',
  warningLight: '#FEF4E6',
  danger: '#F04438',
  dangerLight: '#FEECEB',
  info: '#2E90FA',
  infoLight: '#EAF3FE',

  white: '#FFFFFF',
  overlay: 'rgba(16, 24, 40, 0.5)',
} as const;

export type AppColor = keyof typeof colors;
