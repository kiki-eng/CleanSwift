import { TextStyle } from 'react-native';

import { colors } from './colors';

const base: TextStyle = {
  color: colors.ink900,
};

/** Named text styles used across the app. */
export const typography = {
  displayLg: { ...base, fontSize: 32, fontWeight: '700', lineHeight: 40 },
  display: { ...base, fontSize: 28, fontWeight: '700', lineHeight: 36 },
  titleLg: { ...base, fontSize: 22, fontWeight: '700', lineHeight: 28 },
  title: { ...base, fontSize: 18, fontWeight: '600', lineHeight: 24 },
  bodyLg: { ...base, fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body: { ...base, fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodyMedium: { ...base, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  caption: { ...base, fontSize: 12, fontWeight: '400', lineHeight: 16, color: colors.ink500 },
  captionMedium: { ...base, fontSize: 12, fontWeight: '500', lineHeight: 16, color: colors.ink500 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  buttonSm: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
} satisfies Record<string, TextStyle>;
