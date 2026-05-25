import { formatDate, isoToDateInput } from '@/lib/format';
import { supabase } from '@/lib/supabase';

// Admin data fetchers + aggregation. These read across ALL participants, so
// they require admin SELECT RLS policies on participants/sessions (see the
// is_admin() policies). Without them, queries return empty for everyone.

export type OpenSession = {
  id: string;
  check_in_at: string;
  participantName: string;
  ventureName: string;
};

export type AdminSessionRow = {
  id: string;
  check_in_at: string;
  check_out_at: string | null;
  participantName: string;
  ventureName: string;
};

export type VentureSession = {
  check_in_at: string;
  check_out_at: string | null;
  participant_id: string;
};

/** An open session enriched for the admin dashboard "Here right now" list. */
export type OpenSessionDetail = {
  id: string;
  check_in_at: string;
  participant_id: string;
  firstName: string | null;
  lastName: string | null;
  ventureName: string;
};

export type DayStat = { date: string; label: string; minutes: number; count: number };

// PostgREST embeds a to-one relation as an object; supabase-js types it as an
// array. Normalize either shape to a single value.
function one<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

function fullName(p: { first_name: string | null; last_name: string | null } | null): string {
  if (!p) return 'Unknown';
  return `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Unknown';
}

export async function fetchParticipantCount(): Promise<number> {
  const { count, error } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'participant');
  if (error) throw error;
  return count ?? 0;
}

export async function fetchOpenSessions(): Promise<OpenSession[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, check_in_at, participants(first_name, last_name), ventures(name)')
    .is('check_out_at', null)
    .order('check_in_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    check_in_at: r.check_in_at,
    participantName: fullName(one(r.participants)),
    ventureName: one<{ name: string }>(r.ventures)?.name ?? 'Unknown venture',
  }));
}

/** Open sessions with participant id + name parts (for avatars) and venture name. */
export async function fetchOpenSessionsForDashboard(): Promise<OpenSessionDetail[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, check_in_at, participant_id, participants(first_name, last_name), ventures(name)')
    .is('check_out_at', null)
    .order('check_in_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => {
    const p = one<{ first_name: string | null; last_name: string | null }>(r.participants);
    return {
      id: r.id,
      check_in_at: r.check_in_at,
      participant_id: r.participant_id,
      firstName: p?.first_name ?? null,
      lastName: p?.last_name ?? null,
      ventureName: one<{ name: string }>(r.ventures)?.name ?? 'Unknown venture',
    };
  });
}

export async function fetchRecentSessions(limit = 100): Promise<AdminSessionRow[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, check_in_at, check_out_at, participants(first_name, last_name), ventures(name)')
    .order('check_in_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    check_in_at: r.check_in_at,
    check_out_at: r.check_out_at,
    participantName: fullName(one(r.participants)),
    ventureName: one<{ name: string }>(r.ventures)?.name ?? 'Unknown venture',
  }));
}

export async function fetchVentureName(ventureId: string): Promise<string | null> {
  const { data } = await supabase.from('ventures').select('name').eq('id', ventureId).maybeSingle();
  return (data as { name: string } | null)?.name ?? null;
}

/** Every session across all ventures (admin RLS required), oldest first. */
export async function fetchAllSessions(): Promise<VentureSession[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('check_in_at, check_out_at, participant_id')
    .order('check_in_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as VentureSession[];
}

export async function fetchVentureSessions(ventureId: string): Promise<VentureSession[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('check_in_at, check_out_at, participant_id')
    .eq('venture_id', ventureId)
    .order('check_in_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as VentureSession[];
}

// ---- Pure aggregation over a set of sessions ----

export function sessionMinutes(s: { check_in_at: string; check_out_at: string | null }): number {
  if (!s.check_out_at) return 0;
  return Math.max(0, (new Date(s.check_out_at).getTime() - new Date(s.check_in_at).getTime()) / 60000);
}

export function completedCount(sessions: VentureSession[]): number {
  return sessions.filter((s) => s.check_out_at).length;
}

export function totalMinutes(sessions: VentureSession[]): number {
  return sessions.reduce((sum, s) => sum + sessionMinutes(s), 0);
}

export function averageMinutes(sessions: VentureSession[]): number {
  const c = completedCount(sessions);
  return c ? totalMinutes(sessions) / c : 0;
}

export function distinctParticipants(sessions: VentureSession[]): number {
  return new Set(sessions.map((s) => s.participant_id)).size;
}

/** Per-day totals for completed sessions, newest day first. */
export function perDay(sessions: VentureSession[]): DayStat[] {
  const map = new Map<string, { minutes: number; count: number; label: string }>();
  for (const s of sessions) {
    if (!s.check_out_at) continue;
    const key = isoToDateInput(s.check_in_at);
    const cur = map.get(key) ?? { minutes: 0, count: 0, label: formatDate(s.check_in_at) };
    cur.minutes += sessionMinutes(s);
    cur.count += 1;
    map.set(key, cur);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, v]) => ({ date, label: v.label, minutes: v.minutes, count: v.count }));
}

export type CumulativePoint = { date: string; label: string; hours: number };

/**
 * Running total of completed-session hours, one point per calendar day from the
 * first session to the last. Gaps are filled (flat) so the line is continuous
 * and ready to share an x-axis with per-venture series later. Dates are handled
 * in local time to match `isoToDateInput`.
 */
export function cumulativeByDay(
  sessions: { check_in_at: string; check_out_at: string | null }[],
): CumulativePoint[] {
  const byDay = new Map<string, number>();
  for (const s of sessions) {
    if (!s.check_out_at) continue;
    const key = isoToDateInput(s.check_in_at);
    byDay.set(key, (byDay.get(key) ?? 0) + sessionMinutes(s));
  }
  if (byDay.size === 0) return [];

  const keys = [...byDay.keys()].sort();
  const [sy, sm, sd] = keys[0].split('-').map(Number);
  const [ey, em, ed] = keys[keys.length - 1].split('-').map(Number);
  const cursor = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  const points: CumulativePoint[] = [];
  let cumMinutes = 0;
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    cumMinutes += byDay.get(key) ?? 0;
    points.push({
      date: key,
      label: cursor.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      hours: cumMinutes / 60,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}
