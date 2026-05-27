import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import { SEGMENT_COLORS, type HoursByVentureChartProps } from './chartTypes';

import { TextButton } from '@/components/TextButton';
import { colors, fonts, typography } from '@/lib/theme';

// Native / default fallback (no recharts). Proportional stacked View bars, with
// the same teal ramp + largest-contributor-at-the-bottom order as the web chart.
export function HoursByVentureChart({ data, title, breakpoint = 'desktop' }: HoursByVentureChartProps) {
  const router = useRouter();
  const mobile = breakpoint === 'mobile';
  const rows = mobile ? data.slice(0, 5) : data;
  const max = Math.max(1, ...rows.map((r) => r.hours));
  const hasData = rows.some((r) => r.hours > 0);

  return (
    <Card title={title}>
      {!hasData ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No completed sessions in this period</Text>
        </View>
      ) : (
        <View style={styles.columns}>
          {rows.map((r) => (
            <View key={r.ventureId} style={styles.column}>
              <Text style={styles.val}>{r.hours}h</Text>
              <View style={styles.track}>
                <View style={[styles.fillWrap, { height: `${(r.hours / max) * 100}%` }]}>
                  {/* Stack bottom-up by hours desc: contributors are pre-sorted,
                      so reverse to put the largest (index 0) at the bottom. */}
                  {[...r.contributors].reverse().map((c, i) => {
                    const slot = r.contributors.length - 1 - i;
                    return (
                      <View
                        key={c.participantId}
                        style={{
                          flex: c.hours,
                          backgroundColor: SEGMENT_COLORS[Math.min(slot, SEGMENT_COLORS.length - 1)],
                        }}
                      />
                    );
                  })}
                </View>
              </View>
              <Text style={styles.name} numberOfLines={2}>
                {r.displayName}
              </Text>
            </View>
          ))}
        </View>
      )}
      {mobile && data.length > rows.length && (
        <TextButton label={`Show all ${data.length}`} onPress={() => router.push('/admin/ventures')} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 240 },
  column: { flex: 1, alignItems: 'center', gap: 4, height: '100%' },
  name: { ...typography.subtext, fontSize: 11, color: colors.text, textAlign: 'center' },
  track: { flex: 1, width: 28, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden', justifyContent: 'flex-end' },
  fillWrap: { width: '100%', borderRadius: 3, overflow: 'hidden' },
  val: { ...typography.subtext, fontSize: 13, color: colors.muted, textAlign: 'center', fontFamily: fonts.semibold },
  empty: { height: 240, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.subtext, fontSize: 14, color: colors.muted },
});
