/**
 * Custom hook for accessing theme
 * Place this in: hooks/use-theme.ts
 */

import { useColorScheme as useRNColorScheme } from 'react-native';
import { theme, type Theme } from '../constants/theme';

export function useTheme(): { theme: Theme; isDark: boolean; colorScheme: 'light' | 'dark' } {
  const colorScheme = useRNColorScheme();
  const isDark = colorScheme === 'dark';
  const currentTheme = theme[colorScheme ?? 'light'];

  return {
    theme: currentTheme,
    isDark,
    colorScheme: colorScheme ?? 'light',
  };
}