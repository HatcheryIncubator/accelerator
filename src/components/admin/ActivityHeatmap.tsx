import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';

import { colors, fonts, typography } from '@/lib/theme';

const HOURS = ['8a', '9', '10', '11', '12', '1p', '2', '3', '4', '5', '6'];
const DAYS_FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F'];

/** Quantile-bucket a value into 0–4 using the sorted non-zero counts. */
function levelFor(value: number, sortedNonZero: number[]): number {
  if (value <= 0 || sortedNonZero.length === 0) return 0;
  const rank = sortedNonZero.findIndex((x) => x >= value); // 0-based position
  const q = rank / sortedNonZero.length; // 0..1
  return Math.min(4, 1 + Math.floor(q * 4));
}

export function ActivityHeatmap({ data, compact = false }: { data: number[][]; compact?: boolean }) {
  const sortedNonZero = data
    .flat()
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  const labels = compact ? DAYS_SHORT : DAYS_FULL;
  const labelWidth = compact ? 16 : 34;

  return (
    <Card title="When the cohort works">
      {/* Hour axis */}
      <View style={styles.axisRow}>
        <View style={{ width: labelWidth }} />
        {HOURS.map((h, i) => (
          <Text key={i} style={styles.hourLabel}>
            {h}
          </Text>
        ))}
      </View>

      {/* Weekday rows */}
      {data.map((row, r) => (
        <View key={r} style={styles.gridRow}>
          <Text style={[styles.dayLabel, { width: labelWidth }]}>{labels[r]}</Text>
          {row.map((count, c) => (
            <View key={c} style={styles.cellWrap}>
              <View style={[styles.cell, { backgroundColor: colors.heatmap[levelFor(count, sortedNonZero)] }]} />
            </View>
          ))}
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>less</Text>
        {colors.heatmap.map((c, i) => (
          <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
        ))}
        <Text style={styles.legendText}>more</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  axisRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  hourLabel: { flex: 1, textAlign: 'center', ...typography.subtext, fontSize: 11, color: colors.muted },
  gridRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dayLabel: { ...typography.subtext, fontSize: 11, color: colors.muted },
  cellWrap: { flex: 1 },
  cell: { width: '100%', aspectRatio: 1, borderRadius: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  legendText: { ...typography.subtext, fontSize: 11, color: colors.muted },
  swatch: { width: 14, height: 14, borderRadius: 2 },
});
