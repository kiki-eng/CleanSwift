import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function BrandLogo({ size = 72, style }: Props): React.JSX.Element {
  return (
    <Image
      source={require('../assets/brand/cleanswift-icon.png')}
      accessibilityLabel="CleanSwift logo"
      resizeMode="contain"
      style={[{ width: size, height: size, borderRadius: size * 0.24 }, style]}
    />
  );
}
