import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { fetchRecentSessions, type AdminSessionRow } from '@/lib/admin';
import { formatDate, formatDuration } from '@/lib/format';
import { colors, radius, typography } from '@/lib/theme';

export default function AdminSessionsScreen() {
  const [rows, setRows] = useState<AdminSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetchRecentSessions();
        if (active) setRows(r);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Could not load sessions.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function renderRow({ item }: { item: AdminSessionRow }) {
    const tail = item.check_out_at
      ? formatDuration(item.check_in_at, item.check_out_at)
      : 'In progress';
    return (
      <View style={styles.row}>
        <Text style={styles.title}>{item.participantName}</Text>
        <Text style={styles.meta}>
          {item.ventureName} · {formatDate(item.check_in_at)} · {tail}
        </Text>
      </View>
    );
  }

  return (
    <Screen title="All sessions" scroll={false} paddingHorizontal={24} paddingVertical={16} gap={8}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : rows.length === 0 ? (
        <Text style={styles.muted}>No sessions yet.</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { ...typography.subtext, color: colors.error },
  muted: { ...typography.subtext, color: colors.muted },
  list: { flex: 1 },
  listContent: { paddingBottom: 16 },
  separator: { height: 8 },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 14,
    gap: 4,
  },
  title: { ...typography.button, color: colors.blueDeep },
  meta: { ...typography.subtext, color: colors.muted },
});
