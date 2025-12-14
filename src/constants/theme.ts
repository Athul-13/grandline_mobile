/**
 * Enhanced Theme Configuration
 * Centralized theme system for easy light/dark mode switching
 */

import { Platform } from 'react-native';

// Define color palette
const palette = {
  // Brand colors
  primary: '#C5630C',
  primaryLight: '#FFF5E6',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Light mode colors
  lightBg: '#F4F1DE',
  lightCard: '#FFFFFF',
  lightText: '#11181C',
  lightTextSecondary: '#687076',
  lightBorder: '#E5E5E5',
  
  // Dark mode colors
  darkBg: '#22272B', // Lighter dark background (moved from #151718)
  darkCard: '#2C333A', // Lighter card/surface (moved from #1E1E1E) - better distinction from Bg
  darkText: '#F2F4F5', // Slightly brighter white text
  darkTextSecondary: '#ABB3BB', // Lighter secondary text
  darkBorder: '#404B57',
};

// Theme definitions
export const theme = {
  light: {
    // Background colors
    background: palette.lightBg,
    surface: palette.lightCard,
    card: palette.lightCard,
    
    // Text colors
    text: palette.lightText,
    textSecondary: palette.lightTextSecondary,
    
    // Border colors
    border: palette.lightBorder,
    divider: palette.lightBorder,
    
    // Brand colors
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    
    // Status colors
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    
    // UI elements
    icon: palette.lightTextSecondary,
    iconActive: palette.primary,
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    // Background colors
    background: palette.darkBg,
    surface: palette.darkCard,
    card: palette.darkCard,
    
    // Text colors
    text: palette.darkText,
    textSecondary: palette.darkTextSecondary,
    
    // Border colors
    border: palette.darkBorder,
    divider: palette.darkBorder,
    
    // Brand colors
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    
    // Status colors
    success: '#66BB6A',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#42A5F5',
    
    // UI elements
    icon: palette.darkTextSecondary,
    iconActive: palette.primary,
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// Legacy Colors export for backward compatibility
export const Colors = {
  light: {
    text: theme.light.text,
    background: theme.light.background,
    tint: '#0a7ea4',
    icon: theme.light.icon,
    tabIconDefault: theme.light.icon,
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: theme.dark.text,
    background: theme.dark.background,
    tint: '#fff',
    icon: theme.dark.icon,
    tabIconDefault: theme.dark.icon,
    tabIconSelected: '#fff',
  },
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Typography
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Font families
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Shadow styles
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Tab bar dimensions
export const tabBar = {
  height: 70,
  bottomOffset: 30,  // Space below safe area
  getTotalHeight: (bottomInset: number) => 70 + 30 + bottomInset,
};

// Type definitions for TypeScript
export type Theme = typeof theme.light;
export type ThemeMode = 'light' | 'dark';