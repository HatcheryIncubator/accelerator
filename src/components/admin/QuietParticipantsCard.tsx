import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from './Avatar';
import { Card } from './Card';

import type { QuietItem } from '@/hooks/useAdminDashboard';
import { colors, fonts, radius, typography } from '@/lib/theme';

function daysLabel(daysAgo: number): string {
  if (!Number.isFinite(daysAgo)) return 'Never checked in';
  return `${Math.floor(daysAgo)} days quiet`;
}

function Row({ item }: { item: QuietItem }) {
  const color = item.bucket === 'atRisk' ? colors.statusAtRisk : colors.statusQuiet;
  return (
    <View style={styles.row}>
      <Avatar first={item.name[0] ?? null} last={item.name.split(' ')[1]?.[0] ?? null} size={32} bg={color} />
      <View style={styles.rowText}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.ventureName}
        </Text>
      </View>
      <Text style={[styles.days, { color }]}>{daysLabel(item.daysAgo)}</Text>
    </View>
  );
}

export function QuietParticipantsCard({ items, collapsed = false }: { items: QuietItem[]; collapsed?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return (
      <Card title="Quiet participants">
        <Text style={styles.empty}>Everyone has checked in within the last week.</Text>
      </Card>
    );
  }

  // Mobile: an amber strip with the count + first 3 names; tap to expand.
  if (collapsed && !expanded) {
    const names = items.slice(0, 3).map((i) => i.name.split(' ')[0]).join(', ');
    return (
      <Pressable onPress={() => setExpanded(true)} style={styles.strip}>
        <Text style={styles.stripTitle}>
          {items.length} quiet participant{items.length === 1 ? '' : 's'}
        </Text>
        <Text style={styles.stripNames} numberOfLines={1}>
          {names}
          {items.length > 3 ? ' …' : ''} · tap to view
        </Text>
      </Pressable>
    );
  }

  return (
    <Card title="Quiet participants">
      <View style={styles.list}>
        {items.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  meta: { ...typography.subtext, fontSize: 13, color: colors.muted },
  days: { ...typography.subtext, fontSize: 13, fontFamily: fonts.semibold },
  empty: { ...typography.subtext, color: colors.muted },
  strip: {
    backgroundColor: colors.statusQuietBg,
    borderWidth: 1,
    borderColor: colors.statusQuiet,
    borderRadius: radius,
    padding: 14,
    gap: 4,
  },
  stripTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.statusQuiet },
  stripNames: { ...typography.subtext, fontSize: 13, color: colors.statusQuiet },
});
