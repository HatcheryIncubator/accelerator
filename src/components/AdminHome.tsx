import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { HeaderActions } from './HeaderActions';

import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { fetchOpenSessions, fetchParticipantCount, type OpenSession } from '@/lib/admin';
import { formatTime } from '@/lib/format';
import { colors, radius, typography } from '@/lib/theme';
import { useVentures } from '@/lib/useVentures';
import type { PressableState } from '@/lib/pressable';

export function AdminHome() {
  const router = useRouter();
  const { participant } = useAuth();
  const { ventures, loading: loadingVentures } = useVentures();

  const [openSessions, setOpenSessions] = useState<OpenSession[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    try {
      const [open, count] = await Promise.all([fetchOpenSessions(), fetchParticipantCount()]);
      setOpenSessions(open);
      setParticipantCount(count);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load admin data.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const loading = loadingVentures || loadingData;

  return (
    <Screen title={`Admin · ${participant?.first_name ?? ''}`} showBack={false} headerRight={<HeaderActions />}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      ) : (
        <>
          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.statRow}>
            <Stat value={participantCount} label="Participants" />
            <Stat value={ventures.length} label="Ventures" />
            <Stat value={openSessions.length} label="Checked in" />
          </View>

          <Text style={styles.sectionLabel}>Checked in now</Text>
          {openSessions.length === 0 ? (
            <Text style={styles.muted}>No one is checked in.</Text>
          ) : (
            openSessions.map((s) => (
              <View key={s.id} style={styles.openRow}>
                <Text style={styles.rowTitle}>{s.participantName}</Text>
                <Text style={styles.muted}>
                  {s.ventureName} · since {formatTime(s.check_in_at)}
                </Text>
              </View>
            ))
          )}

          <SecondaryButton label="All sessions" onPress={() => router.push('/admin/sessions')} />

          <Text style={styles.sectionLabel}>Ventures</Text>
          {ventures.map((v) => (
            <Pressable
              key={v.id}
              accessibilityRole="button"
              accessibilityLabel={`${v.name} stats`}
              onPress={() => router.push({ pathname: '/admin/venture/[id]', params: { id: v.id } })}
              style={({ pressed, hovered }: PressableState) => [
                styles.ventureRow,
                (pressed || (Platform.OS === 'web' && hovered)) && styles.ventureRowActive,
              ]}>
              <Text style={styles.rowTitle}>{v.name}</Text>
              <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
            </Pressable>
          ))}
        </>
      )}
    </Screen>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  error: {
    ...typography.subtext,
    color: colors.error,
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...typography.heading,
    color: colors.blueDeep,
  },
  statLabel: {
    ...typography.subtext,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  sectionLabel: {
    ...typography.fieldLabel,
    color: colors.muted,
    marginTop: 4,
  },
  muted: {
    ...typography.subtext,
    color: colors.muted,
  },
  openRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 14,
    gap: 4,
  },
  rowTitle: {
    ...typography.button,
    color: colors.blueDeep,
  },
  ventureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  ventureRowActive: {
    backgroundColor: '#f8f8f7',
  },
});
