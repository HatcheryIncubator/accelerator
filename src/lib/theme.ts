import type { TextStyle } from 'react-native';

/**
 * Design tokens for The Hatchery check-in/check-out app.
 * Values are exact per the design spec.
 */

export const colors = {
  blue: '#002878', // Emory primary navy — buttons, header, links, focus
  blueDeep: '#001d5c', // darker navy — pressed states, title accents
  blueBright: '#6384c6', // Emory accent blue — charts, status text
  gold: '#c79000', // Emory gold — H1 headings, accent stripes
  goldBg: '#fbf9ed', // Emory cream — status card background
  bodyBg: '#fcfcfc',
  surface: '#ffffff',
  text: '#333333', // Emory default body/heading text
  muted: '#666666', // Emory secondary text / H2
  border: '#ededed',
  error: '#A64141',
  // Admin dashboard — semantic status + chart palette.
  statusActive: '#1D9E75', // green — checked in / active now
  statusActiveBg: '#E1F5EE',
  statusQuiet: '#854F0B', // amber — quiet 7–13 days
  statusQuietBg: '#FAEEDA',
  statusAtRisk: '#A32D2D', // red — quiet 14+ days / never seen
  statusAtRiskBg: '#FCEBEB',
  chartBar: '#185FA5',
  chartBarLight: '#B5D4F4',
  // Heatmap intensity ramp (low → high).
  heatmap: ['#F1EFE8', '#E6F1FB', '#B5D4F4', '#378ADD', '#185FA5'],
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
