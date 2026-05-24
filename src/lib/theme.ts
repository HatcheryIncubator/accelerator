import type { TextStyle } from 'react-native';

/**
 * Design tokens for The Hatchery check-in/check-out app.
 * Values are exact per the design spec.
 */

export const colors = {
  blue: '#012169',
  blueDeep: '#0c2340',
  blueBright: '#007dba',
  gold: '#f2a900',
  goldBg: '#fff8e6',
  bodyBg: '#fafafa',
  surface: '#ffffff',
  text: '#1a1a1a',
  muted: '#6b6b6b',
  border: '#e0e0e0',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Open Sans family names exposed by @expo-google-fonts/open-sans. */
export const fonts = {
  regular: 'OpenSans_400Regular',
  semibold: 'OpenSans_600SemiBold',
  bold: 'OpenSans_700Bold',
} as const;

/** Type scale — all Open Sans. */
export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 32 },
  heading: { fontFamily: fonts.bold, fontSize: 24 },
  headerBar: { fontFamily: fonts.semibold, fontSize: 20 },
  body: { fontFamily: fonts.regular, fontSize: 18 },
  button: { fontFamily: fonts.semibold, fontSize: 18 },
  subtext: { fontFamily: fonts.regular, fontSize: 16 },
  fieldLabel: { fontFamily: fonts.semibold, fontSize: 16 },
} satisfies Record<string, TextStyle>;

/** Shared max width so screens stay phone-shaped in a desktop browser. */
export const CONTENT_MAX_WIDTH = 480;

export const radius = 6;
