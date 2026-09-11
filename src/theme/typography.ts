import { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * Plus Jakarta Sans, linked as static per-weight files (see assets/fonts).
 * Custom fonts on RN should be selected via fontFamily, not fontWeight —
 * mixing the two with a non-variable font causes inconsistent fake-bolding.
 */
export const fontFamily = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
} as const;

const base: TextStyle = {
  color: colors.ink900,
  fontFamily: fontFamily.regular,
};

/** Named text styles used across the app. */
export const typography = {
  displayLg: {
    ...base,
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  display: {
    ...base,
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  titleLg: {
    ...base,
    fontFamily: fontFamily.semiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  title: {
    ...base,
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  bodyLg: { ...base, fontSize: 16, lineHeight: 24 },
  body: { ...base, fontSize: 14, lineHeight: 20 },
  bodyMedium: { ...base, fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20 },
  caption: { ...base, fontSize: 12, lineHeight: 16, color: colors.ink500 },
  captionMedium: {
    ...base,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink500,
  },
  button: { ...base, fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 24, color: colors.white },
  buttonSm: { ...base, fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20, color: colors.white },
} satisfies Record<string, TextStyle>;
