import type { HoursByVenture, WeekPoint } from '@/hooks/useAdminDashboard';
import type { Breakpoint } from '@/hooks/useBreakpoint';

// Shared prop types so the .web (recharts) and base (native fallback) chart
// implementations stay in lockstep.
export type HoursByVentureChartProps = {
  data: HoursByVenture[];
  title: string;
  breakpoint?: Breakpoint;
};
export type SessionsPerWeekChartProps = { data: WeekPoint[] };

// Teal monochromatic ramp for stacked contributor segments, darkest first so
// the largest contributor sits at the bottom of each bar. Index 4 doubles as
// the "+others" colour. Mirrors the segment order produced by the data layer.
export const SEGMENT_COLORS = ['#04342C', '#0F6E56', '#1D9E75', '#5DCAA5', '#9FE1CB'] as const;

// Generic legend labels: actual names differ per venture, so they only appear
// in the tooltip on hover.
export const SEGMENT_LABELS = ['Person 1', 'Person 2', 'Person 3', 'Person 4', '+others'] as const;

export const MAX_SEGMENTS = SEGMENT_COLORS.length;
