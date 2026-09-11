/**
 * CleanSwift palette — a deep, confident teal paired with warm stone
 * neutrals (rather than cold blue-grays) for a premium but human,
 * home-services feel. Every existing token name is preserved so this
 * file is a drop-in refinement, not a breaking change.
 */
export const colors = {
  // Brand
  primary: '#0D9488',
  primaryDark: '#0F766E',
  primaryDarker: '#134E4A',
  primaryLight: '#CCFBF1',
  primaryTint: '#F0FDFA',

  // Accent (warm amber for ratings/highlights)
  accent: '#F59E0B',
  accentLight: '#FEF3C7',

  // Neutrals (warm "ink" scale)
  ink900: '#1C1917',
  ink800: '#292524',
  ink700: '#44403C',
  ink500: '#78716C',
  ink400: '#A8A29E',
  ink300: '#D6D3D1',
  ink200: '#E7E5E4',
  ink100: '#F5F5F4',
  ink50: '#FAFAF9',

  // Surfaces
  background: '#FBFBFA',
  surface: '#FFFFFF',
  surfaceSubtle: '#F7F6F4',

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
  overlay: 'rgba(28, 25, 23, 0.55)',
} as const;

export type AppColor = keyof typeof colors;
