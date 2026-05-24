const plugin = require('tailwindcss/plugin');
const { Colors, Accent, Spacing } = require('./src/styles/tokens');

// Everything below is derived from src/styles/tokens.ts — the single source of
// truth for design tokens. You shouldn't need to edit values in this file.

// Spacing numbers -> px strings, reused for both spacing and border radius.
const spacing = Object.fromEntries(Object.entries(Spacing).map(([k, v]) => [k, `${v}px`]));

// Color utilities point at CSS variables so light/dark switching is automatic.
const colors = Object.fromEntries(Object.keys(Colors.light).map((k) => [k, `var(--color-${k})`]));

// `:root` variable maps for each scheme, e.g. { '--color-background': '#fff' }.
const toVars = (scheme) =>
  Object.fromEntries(Object.entries(Colors[scheme]).map(([k, v]) => [`--color-${k}`, v]));

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: { ...colors, accent: Accent },
      spacing,
      borderRadius: spacing,
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      maxWidth: {
        content: '800px',
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root': toVars('light'),
        '@media (prefers-color-scheme: dark)': { ':root': toVars('dark') },
      });
    }),
  ],
};
