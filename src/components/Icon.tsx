import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors } from '../theme';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

/** Thin wrapper so the icon library can be swapped in one place. */
export function Icon({ name, size = 22, color = colors.ink700 }: IconProps): React.JSX.Element {
  return <Ionicons name={name} size={size} color={color} />;
}
