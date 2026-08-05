// components/themed-view.tsx
// Scaffold component — wraps RN View with light/dark background support.
// Uses useColorScheme + Colors directly to avoid broken useThemeColor typing.

import { View, type ViewProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const backgroundColor: string = isDark
    ? (darkColor ?? Colors.background)
    : (lightColor ?? Colors.background);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
