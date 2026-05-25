import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import type { HoursByVentureChartProps } from './chartTypes';

import { TextButton } from '@/components/TextButton';
import { colors, fonts, typography } from '@/lib/theme';

// Native / default fallback (no recharts). Simple proportional View bars.
export function HoursByVentureChart({ data, title, mobile = false }: HoursByVentureChartProps) {
  const router = useRouter();
  const rows = mobile ? data.slice(0, 5) : data;
  const max = Math.max(1, ...rows.map((r) => r.hours));

  return (
    <Card title={title}>
      <View style={styles.list}>
        {rows.map((r) => (
          <View key={r.ventureId} style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>
              {r.name}
            </Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(r.hours / max) * 100}%` }]} />
            </View>
            <Text style={styles.val}>{r.hours}h</Text>
          </View>
        ))}
      </View>
      {mobile && data.length > rows.length && (
        <TextButton label={`Show all ${data.length}`} onPress={() => router.push('/admin/ventures')} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { ...typography.subtext, fontSize: 13, color: colors.text, width: 96 },
  track: { flex: 1, height: 14, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.chartBar, borderRadius: 3 },
  val: { ...typography.subtext, fontSize: 13, color: colors.muted, width: 40, textAlign: 'right', fontFamily: fonts.semibold },
});
