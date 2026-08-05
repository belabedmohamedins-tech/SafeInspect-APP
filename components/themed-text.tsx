// components/themed-text.tsx
// Scaffold component — wraps RN Text with light/dark color support.
// Uses useColorScheme + Colors directly to avoid broken useThemeColor typing
// (Colors in this project is a flat object, not {light,dark} sub-objects).

import { Text, type TextProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const color: string = isDark
    ? (darkColor ?? Colors.textPrimary)
    : (lightColor ?? Colors.textPrimary);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? { fontSize: 16, lineHeight: 24 } : undefined,
        type === 'title' ? { fontSize: 32, fontWeight: 'bold', lineHeight: 32 } : undefined,
        type === 'defaultSemiBold' ? { fontSize: 16, lineHeight: 24, fontWeight: '600' } : undefined,
        type === 'subtitle' ? { fontSize: 20, fontWeight: 'bold' } : undefined,
        type === 'link' ? { lineHeight: 30, fontSize: 16, color: '#0a7ea4' } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
