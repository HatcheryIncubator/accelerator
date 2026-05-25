import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import type { SessionsPerWeekChartProps } from './chartTypes';

import { colors, fonts, typography } from '@/lib/theme';

// Native / default fallback (no recharts): week label + count with a mini bar.
export function SessionsPerWeekChart({ data }: SessionsPerWeekChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <Card title="Sessions per week">
      <View style={styles.list}>
        {data.map((d) => (
          <View key={d.weekStart} style={styles.row}>
            <Text style={styles.label}>{d.label}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(d.count / max) * 100}%` }]} />
            </View>
            <Text style={styles.val}>{d.count}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { ...typography.subtext, fontSize: 12, color: colors.muted, width: 56 },
  track: { flex: 1, height: 12, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.chartBarLight, borderRadius: 3 },
  val: { ...typography.subtext, fontSize: 12, color: colors.text, width: 28, textAlign: 'right', fontFamily: fonts.semibold },
});
