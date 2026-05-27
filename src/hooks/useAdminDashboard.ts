import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchOpenSessionsForDashboard,
  sessionMinutes,
  totalMinutes,
  type OpenSessionDetail,
  type VentureSession,
} from '@/lib/admin';
import { useNow } from '@/hooks/useNow';
import { supabase } from '@/lib/supabase';
import { ventureDisplayName } from '@/lib/ventureNames';
import type { Participant, Venture } from '@/types';

export type DateRange = 'last7' | 'last30' | 'cohort';

export const RANGE_LABELS: Record<DateRange, string> = {
  last7: 'Last 7 days',
  last30: 'Last 30 days',
  cohort: 'Cohort to date',
};

const DAY_MS = 86_400_000;

export type QuietItem = {
  id: string;
  name: string;
  ventureName: string;
  daysAgo: number; // Infinity = never checked in
  bucket: 'quiet' | 'atRisk';
};

/** One person's completed hours on a venture (or the merged "+others" slot). */
export type VentureContributor = { participantId: string; name: string; hours: number };

export type HoursByVenture = {
  ventureId: string;
  name: string;
  displayName: string; // short name for long titles — see lib/ventureNames
  hours: number; // total, == sum of `contributors` hours (kept consistent for the stacked bar)
  // Sorted by hours desc, capped at MAX_VENTURE_SEGMENTS; the last entry is
  // "+others" when the venture has more contributors than will fit as segments.
  contributors: VentureContributor[];
};

// Top N contributors shown as discrete segments; the rest collapse into "+others".
const MAX_VENTURE_SEGMENTS = 5;

function mergeContributors(sorted: VentureContributor[]): VentureContributor[] {
  if (sorted.length <= MAX_VENTURE_SEGMENTS) return sorted;
  const head = sorted.slice(0, MAX_VENTURE_SEGMENTS - 1);
  const others = sorted
    .slice(MAX_VENTURE_SEGMENTS - 1)
    .reduce((sum, c) => sum + c.hours, 0);
  return [...head, { participantId: '+others', name: '+others', hours: others }];
}

export type WeekPoint = { weekStart: string; label: string; count: number; avg: number };

export type AdminDashboardData = {
  loading: boolean;
  error: string | null;
  kpis: {
    participants: number;
    avgWeeklyHoursPerVenture: number;
    checkedInNow: number;
    activeVentures: { active: number; total: number };
  };
  hereNow: OpenSessionDetail[];
  quiet: QuietItem[];
  hoursByVenture: HoursByVenture[];
  heatmap: number[][]; // [5 weekdays Mon–Fri][11 hours 8–18] check-in counts
  sessionsPerWeek: WeekPoint[];
  refresh: () => void;
};

// --- date helpers (local time) ---

function rangeStartIso(range: DateRange): string {
  const now = Date.now();
  if (range === 'last7') return new Date(now - 7 * DAY_MS).toISOString();
  if (range === 'last30') return new Date(now - 30 * DAY_MS).toISOString();
  return new Date(0).toISOString(); // cohort = all time
}

/** Local Monday (00:00) of the week containing `d`, as YYYY-MM-DD. */
function mondayKey(d: Date): string {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (m.getDay() + 6) % 7; // 0 = Monday
  m.setDate(m.getDate() - dow);
  const mm = String(m.getMonth() + 1).padStart(2, '0');
  const dd = String(m.getDate()).padStart(2, '0');
  return `${m.getFullYear()}-${mm}-${dd}`;
}

function weekLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

type RangeRow = VentureSession & { venture_id: string };
type SeenRow = { participant_id: string; check_in_at: string };

export function useAdminDashboard(range: DateRange): AdminDashboardData {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [rangeSessions, setRangeSessions] = useState<RangeRow[]>([]);
  const [seenRows, setSeenRows] = useState<SeenRow[]>([]);
  const [openSessions, setOpenSessions] = useState<OpenSessionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const now = useNow(30_000); // reactive clock for "last 7 days" + quiet buckets

  const loadOpen = useCallback(async () => {
    try {
      setOpenSessions(await fetchOpenSessionsForDashboard());
    } catch {
      // Silent: the heavy load surfaces errors; a transient poll failure is fine.
    }
  }, []);

  const loadHeavy = useCallback(async (): Promise<boolean> => {
    const startIso = rangeStartIso(range);
    const [pRes, vRes, sRes, seenRes] = await Promise.all([
      supabase.from('participants').select('id, email, first_name, last_name, role, venture_ids'),
      supabase.from('ventures').select('id, name').order('name'),
      supabase
        .from('sessions')
        .select('check_in_at, check_out_at, participant_id, venture_id')
        .gte('check_in_at', startIso)
        .order('check_in_at', { ascending: true }),
      supabase
        .from('sessions')
        .select('participant_id, check_in_at')
        .order('check_in_at', { ascending: false }),
    ]);
    const firstErr = pRes.error || vRes.error || sRes.error || seenRes.error;
    if (firstErr) throw firstErr;
    setParticipants((pRes.data ?? []) as Participant[]);
    setVentures((vRes.data ?? []).map((v: any) => ({ id: String(v.id), name: v.name })));
    setRangeSessions((sRes.data ?? []) as RangeRow[]);
    setSeenRows((seenRes.data ?? []) as SeenRow[]);
    return true;
  }, [range]);

  // State-setting lives in this callback (not the effect body) to satisfy the
  // React Compiler's set-state-in-effect rule.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadHeavy(), loadOpen()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [loadHeavy, loadOpen]);

  // Heavy load on mount + whenever the range changes (load depends on range).
  useEffect(() => {
    void load();
  }, [load]);

  // Poll only the live "who's here now" data every 30s (no skeleton flip).
  useEffect(() => {
    const id = setInterval(() => void loadOpen(), 30_000);
    return () => clearInterval(id);
  }, [loadOpen]);

  const derived = useMemo(() => {
    const roster = participants.filter((p) => p.role === 'participant');
    const ventureName = new Map(ventures.map((v) => [v.id, v.name]));

    // Active ventures: distinct ventures with any check-in within the selected
    // range (so "Cohort to date" counts every venture that's ever been active).
    const activeVentureIds = new Set(
      rangeSessions.map((s) => s.venture_id).filter((id) => ventureName.has(id)),
    );
    const activeVentures = { active: activeVentureIds.size, total: ventures.length };

    // Last-seen per participant (seenRows is newest-first, so first hit = max).
    const lastSeen = new Map<string, string>();
    for (const r of seenRows) if (!lastSeen.has(r.participant_id)) lastSeen.set(r.participant_id, r.check_in_at);

    const quiet: QuietItem[] = roster
      .map((p): QuietItem => {
        const seen = lastSeen.get(p.id);
        const daysAgo = seen ? (now - new Date(seen).getTime()) / DAY_MS : Infinity;
        const name = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email || 'Unknown';
        const vName = ventureName.get(p.venture_ids?.[0] ?? '') ?? 'No venture';
        return { id: p.id, name, ventureName: vName, daysAgo, bucket: daysAgo >= 14 ? 'atRisk' : 'quiet' };
      })
      .filter((q) => q.daysAgo > 7)
      .sort((a, b) => b.daysAgo - a.daysAgo);

    // Hours by venture, broken down per participant (completed only —
    // sessionMinutes returns 0 for open sessions). Minutes accumulate per
    // (venture, participant) pair, then round to hours once at the end.
    const personName = new Map<string, string>();
    for (const p of participants) {
      personName.set(
        p.id,
        `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email || 'Unknown',
      );
    }
    const minutesByVenturePerson = new Map<string, Map<string, number>>();
    for (const s of rangeSessions) {
      const m = sessionMinutes(s);
      if (m <= 0) continue;
      let inner = minutesByVenturePerson.get(s.venture_id);
      if (!inner) {
        inner = new Map();
        minutesByVenturePerson.set(s.venture_id, inner);
      }
      inner.set(s.participant_id, (inner.get(s.participant_id) ?? 0) + m);
    }
    const hoursByVenture: HoursByVenture[] = ventures
      .map((v) => {
        const inner = minutesByVenturePerson.get(v.id);
        const contributors = mergeContributors(
          [...(inner?.entries() ?? [])]
            .map(([pid, min]) => ({
              participantId: pid,
              name: personName.get(pid) ?? 'Unknown',
              hours: Math.round(min / 60),
            }))
            .filter((c) => c.hours > 0)
            .sort((a, b) => b.hours - a.hours),
        );
        const hours = contributors.reduce((sum, c) => sum + c.hours, 0);
        return {
          ventureId: v.id,
          name: v.name,
          displayName: ventureDisplayName(v.name),
          hours,
          contributors,
        };
      })
      .sort((a, b) => b.hours - a.hours);

    // Heatmap: 5 weekdays (Mon–Fri) × 11 hours (8–18), counting check-ins.
    const heatmap: number[][] = Array.from({ length: 5 }, () => Array(11).fill(0));
    for (const s of rangeSessions) {
      const d = new Date(s.check_in_at);
      const dow = d.getDay(); // 0=Sun..6=Sat
      const hour = d.getHours();
      if (dow >= 1 && dow <= 5 && hour >= 8 && hour <= 18) heatmap[dow - 1][hour - 8] += 1;
    }

    // Sessions per week + 4-week trailing average.
    const byWeek = new Map<string, number>();
    for (const s of rangeSessions) {
      const key = mondayKey(new Date(s.check_in_at));
      byWeek.set(key, (byWeek.get(key) ?? 0) + 1);
    }
    const weekKeys = [...byWeek.keys()].sort();
    const sessionsPerWeek: WeekPoint[] = weekKeys.map((key, i) => {
      const window = weekKeys.slice(Math.max(0, i - 3), i + 1);
      const avg = window.reduce((sum, k) => sum + (byWeek.get(k) ?? 0), 0) / window.length;
      return { weekStart: key, label: weekLabel(key), count: byWeek.get(key) ?? 0, avg: Math.round(avg) };
    });

    // Average completed hours per week per venture. Weeks come from the range
    // length (cohort = span since the earliest session), so this reads against
    // the ~40h/week target regardless of which range is selected.
    const totalHours = totalMinutes(rangeSessions) / 60;
    const earliestMs = rangeSessions.length ? new Date(rangeSessions[0].check_in_at).getTime() : now;
    const weeks =
      range === 'last7' ? 1 : range === 'last30' ? 30 / 7 : Math.max(1, (now - earliestMs) / (7 * DAY_MS));
    const avgWeeklyHoursPerVenture =
      ventures.length && weeks > 0 ? Math.round(totalHours / ventures.length / weeks) : 0;

    return {
      kpis: {
        participants: roster.length,
        avgWeeklyHoursPerVenture,
        checkedInNow: openSessions.length,
        activeVentures,
      },
      quiet,
      hoursByVenture,
      heatmap,
      sessionsPerWeek,
    };
  }, [participants, ventures, rangeSessions, seenRows, openSessions, now, range]);

  return {
    loading,
    error,
    hereNow: openSessions,
    refresh: () => void loadHeavy(),
    ...derived,
  };
}
