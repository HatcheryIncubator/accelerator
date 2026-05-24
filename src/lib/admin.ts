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
    .select('*', { count: 'exact', head: true });
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
