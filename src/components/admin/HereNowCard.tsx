import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from './Avatar';

import { useNow } from '@/hooks/useNow';
import type { OpenSessionDetail } from '@/lib/admin';
import { formatDuration } from '@/lib/format';
import { colors, fonts, radius, typography } from '@/lib/theme';

export function HereNowCard({ items, hero = false }: { items: OpenSessionDetail[]; hero?: boolean }) {
  const nowIso = new Date(useNow(30_000)).toISOString();
  return (
    <View style={[styles.card, hero && styles.hero]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={styles.dot} />
          <Text style={styles.title}>Here right now</Text>
        </View>
        <Text style={styles.count}>{items.length}</Text>
      </View>

      {items.length === 0 ? (
        <Text style={styles.empty}>Nobody is checked in right now.</Text>
      ) : (
        <View style={styles.list}>
          {items.map((s) => (
            <View key={s.id} style={styles.row}>
              <Avatar first={s.firstName} last={s.lastName} size={36} bg={colors.statusActive} />
              <View style={styles.rowText}>
                <Text style={styles.name} numberOfLines={1}>
                  {`${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || 'Unknown'}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {s.ventureName} · {formatDuration(s.check_in_at, nowIso)}
                </Text>
              </View>
              <View style={styles.rowDot} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 16,
    gap: 12,
  },
  hero: { backgroundColor: colors.statusActiveBg, borderColor: colors.statusActive },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.statusActive },
  title: { ...typography.fieldLabel, color: colors.blueDeep },
  count: { ...typography.heading, color: colors.statusActive },
  empty: { ...typography.subtext, color: colors.muted },
  list: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  meta: { ...typography.subtext, fontSize: 13, color: colors.muted },
  rowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.statusActive },
});
