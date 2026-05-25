import type { HoursByVenture, WeekPoint } from '@/hooks/useAdminDashboard';

// Shared prop types so the .web (recharts) and base (native fallback) chart
// implementations stay in lockstep.
export type HoursByVentureChartProps = { data: HoursByVenture[]; title: string; mobile?: boolean };
export type SessionsPerWeekChartProps = { data: WeekPoint[] };
