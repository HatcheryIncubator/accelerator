/**
 * Single source of truth for design tokens.
 *
 * This file intentionally has NO `react-native` (or any platform) imports, so
 * it can be consumed from both sides of the styling boundary:
 * - `tailwind.config.js` imports it at build time to generate Tailwind color
 *   utilities, the light/dark CSS variables, and the spacing/radius scale.
 * - App code imports it at runtime for values that must be plain JS — colors
 *   passed to native APIs (NativeTabs, SymbolView) via `useTheme`, and spacing
 *   used in layout math.
 *
 * Edit values here; everything else derives from them.
 */

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#f0f0f3',
    backgroundSelected: '#e0e1e6',
    textSecondary: '#60646c',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2e3135',
    textSecondary: '#b0b4ba',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Fixed brand color (does not change between light and dark). */
export const Accent = '#3c87f7';

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;
