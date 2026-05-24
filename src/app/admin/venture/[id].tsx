import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import {
  averageMinutes,
  completedCount,
  distinctParticipants,
  fetchVentureName,
  fetchVentureSessions,
  perDay,
  totalMinutes,
  type DayStat,
  type VentureSession,
} from '@/lib/admin';
import { formatMinutes } from '@/lib/format';
import { colors, radius, typography } from '@/lib/theme';

export default function VentureStatsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [name, setName] = useState<string | null>(null);
  const [sessions, setSessions] = useState<VentureSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id) return;
      try {
        const [vName, vSessions] = await Promise.all([
          fetchVentureName(id),
          fetchVentureSessions(id),
        ]);
        if (!active) return;
        setName(vName);
        setSessions(vSessions);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Could not load venture stats.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const days: DayStat[] = perDay(sessions);
  const open = sessions.filter((s) => !s.check_out_at).length;

  return (
    <Screen title={name ?? 'Venture'} gap={12}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <View style={styles.statGrid}>
            <Stat value={formatMinutes(totalMinutes(sessions))} label="Total time" />
            <Stat value={String(completedCount(sessions))} label="Sessions" />
            <Stat value={formatMinutes(averageMinutes(sessions))} label="Avg session" />
            <Stat value={String(distinctParticipants(sessions))} label="People" />
          </View>
          {open > 0 && <Text style={styles.muted}>{open} currently checked in.</Text>}

          <Text style={styles.sectionLabel}>By day</Text>
          {days.length === 0 ? (
            <Text style={styles.muted}>No completed sessions yet.</Text>
          ) : (
            days.map((d) => (
              <View key={d.date} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{d.label}</Text>
                <Text style={styles.muted}>
                  {formatMinutes(d.minutes)} · {d.count} {d.count === 1 ? 'session' : 'sessions'}
                </Text>
              </View>
            ))
          )}
        </>
      )}
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { paddingVertical: 24, alignItems: 'center' },
  error: { ...typography.subtext, color: colors.error },
  muted: { ...typography.subtext, color: colors.muted },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stat: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 4,
  },
  statValue: { ...typography.heading, color: colors.blueDeep },
  statLabel: { ...typography.subtext, fontSize: 13, color: colors.muted },
  sectionLabel: { ...typography.fieldLabel, color: colors.muted, marginTop: 4 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  dayLabel: { ...typography.button, color: colors.blueDeep },
});
