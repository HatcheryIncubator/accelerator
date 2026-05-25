import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/lib/theme';

type Tone = 'default' | 'active';

export function KpiTile({
  label,
  value,
  tone = 'default',
  hint,
  minWidth = 160,
}: {
  label: string;
  value: string | number;
  tone?: Tone;
  hint?: string;
  minWidth?: number;
}) {
  const active = tone === 'active';
  return (
    <View style={[styles.tile, { minWidth }, active && styles.tileActive]}>
      <View style={styles.labelRow}>
        {active && <View style={styles.dot} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, active && styles.valueActive]}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
  },
  tileActive: {
    backgroundColor: colors.statusActiveBg,
    borderColor: colors.statusActive,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.statusActive },
  label: { ...typography.subtext, fontSize: 13, color: colors.muted },
  value: { ...typography.heading, color: colors.blueDeep },
  valueActive: { color: colors.statusActive },
  hint: { ...typography.subtext, fontSize: 12, color: colors.muted },
});
