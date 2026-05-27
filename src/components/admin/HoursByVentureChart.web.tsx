import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';

import { Card } from './Card';
import { SEGMENT_COLORS, SEGMENT_LABELS, type HoursByVentureChartProps } from './chartTypes';

import type { HoursByVenture } from '@/hooks/useAdminDashboard';
import { TextButton } from '@/components/TextButton';
import { colors, fonts } from '@/lib/theme';

const HEIGHT = 320;
const PERSON_KEYS = ['person1', 'person2', 'person3', 'person4', 'person5'] as const;
const NAME_KEYS = ['p1Name', 'p2Name', 'p3Name', 'p4Name', 'p5Name'] as const;

type ChartRow = {
  ventureId: string;
  name: string;
  displayName: string;
  total: number;
} & Record<(typeof PERSON_KEYS)[number], number> &
  Record<(typeof NAME_KEYS)[number], string>;

function toChartRow(v: HoursByVenture): ChartRow {
  const row = {
    ventureId: v.ventureId,
    name: v.name,
    displayName: v.displayName,
    total: v.hours,
  } as ChartRow;
  for (let i = 0; i < PERSON_KEYS.length; i++) {
    const c = v.contributors[i];
    row[PERSON_KEYS[i]] = c?.hours ?? 0;
    row[NAME_KEYS[i]] = c?.name ?? '';
  }
  return row;
}

/** 0 → 50, 130 → 150, etc. — round-number top so the y-axis never auto-scales. */
function yAxisTicks(maxTotal: number): number[] {
  const top = Math.max(50, Math.ceil(maxTotal / 50) * 50);
  const ticks: number[] = [];
  for (let t = 0; t <= top; t += 50) ticks.push(t);
  return ticks;
}

type Hover = { ventureIndex: number; slot: number };

export function HoursByVentureChart({ data, title, breakpoint = 'desktop' }: HoursByVentureChartProps) {
  // Mounted gate: effects don't run during the Node static-export prerender, so
  // only the fixed-height placeholder is emitted; recharts mounts after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouter();

  const mobile = breakpoint === 'mobile';
  const rows = useMemo(() => {
    const all = data.map(toChartRow);
    return mobile ? all.slice(0, 5) : all;
  }, [data, mobile]);

  const [hover, setHover] = useState<Hover | null>(null);
  const [expanded, setExpanded] = useState<ChartRow | null>(null);

  const ticks = useMemo(() => yAxisTicks(Math.max(0, ...rows.map((r) => r.total))), [rows]);
  const domainMax = ticks[ticks.length - 1];
  const hasData = rows.some((r) => r.total > 0);

  const goToVenture = (ventureId: string) =>
    router.push({ pathname: '/admin/venture/[id]', params: { id: ventureId } });

  const cellOpacity = (ventureIndex: number, slot: number) =>
    hover && (hover.ventureIndex !== ventureIndex || hover.slot !== slot) ? 0.4 : 1;

  const segments = SEGMENT_COLORS.map((color, slot) => (
    <Bar
      key={PERSON_KEYS[slot]}
      dataKey={PERSON_KEYS[slot]}
      stackId="venture"
      fill={color}
      maxBarSize={48}
      stroke="#fff"
      strokeWidth={1}
      cursor="pointer"
      isAnimationActive={false}
      onMouseEnter={(_, index: number) => setHover({ ventureIndex: index, slot })}
      onClick={(_, index: number) => {
        const r = rows[index];
        if (!r) return;
        if (mobile) setExpanded((cur) => (cur?.ventureId === r.ventureId ? null : r));
        else goToVenture(r.ventureId);
      }}>
      {rows.map((r, index) => (
        <Cell key={r.ventureId} fill={color} fillOpacity={cellOpacity(index, slot)} />
      ))}
    </Bar>
  ));

  const label =
    breakpoint === 'tablet' ? { angle: -45, fontSize: 10 } : { angle: -30, fontSize: 11 };

  return (
    <Card title={title}>
      <Legend />
      {!mounted ? (
        <View style={{ height: HEIGHT }} />
      ) : !hasData ? (
        <View style={[styles.empty, { height: HEIGHT }]}>
          <Text style={styles.emptyText}>No completed sessions in this period</Text>
        </View>
      ) : (
        <View style={{ width: '100%', height: HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            {mobile ? (
              <BarChart layout="vertical" data={rows} margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                <CartesianGrid horizontal={false} stroke={colors.border} />
                <XAxis
                  type="number"
                  domain={[0, domainMax]}
                  ticks={ticks}
                  tick={{ fontSize: 11, fill: colors.muted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="displayName"
                  width={84}
                  tick={{ fontSize: 11, fill: colors.muted }}
                  axisLine={false}
                  tickLine={false}
                />
                {segments}
              </BarChart>
            ) : (
              <BarChart
                data={rows}
                margin={{ top: 0, right: 16, bottom: 72, left: 0 }}
                onMouseLeave={() => setHover(null)}>
                <CartesianGrid vertical={false} stroke={colors.border} />
                <XAxis
                  type="category"
                  dataKey="displayName"
                  interval={0}
                  angle={label.angle}
                  textAnchor="end"
                  height={72}
                  tick={{ fontSize: label.fontSize, fill: colors.muted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  domain={[0, domainMax]}
                  ticks={ticks}
                  width={40}
                  tick={{ fontSize: 11, fill: colors.muted }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={false}
                  allowEscapeViewBox={{ x: false, y: false }}
                  wrapperStyle={{ outline: 'none' }}
                  content={<VentureTooltip hoveredSlot={hover?.slot} />}
                />
                {segments}
              </BarChart>
            )}
          </ResponsiveContainer>
        </View>
      )}

      {mobile && expanded && <MobileBreakdown row={expanded} onOpen={() => goToVenture(expanded.ventureId)} />}
      {mobile && data.length > rows.length && (
        <TextButton label={`Show all ${data.length}`} onPress={() => router.push('/admin/ventures')} />
      )}
    </Card>
  );
}

function Legend() {
  return (
    <View style={styles.legend}>
      {SEGMENT_LABELS.map((labelText, i) => (
        <View key={labelText} style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: SEGMENT_COLORS[i] }]} />
          <Text style={styles.legendText}>{labelText}</Text>
        </View>
      ))}
    </View>
  );
}

type VentureTooltipProps = TooltipProps<number, string> & { hoveredSlot?: number };

function VentureTooltip({ active, payload, hoveredSlot }: VentureTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as ChartRow | undefined;
  if (!row) return null;

  const people = PERSON_KEYS.map((key, i) => ({
    slot: i,
    color: SEGMENT_COLORS[i],
    name: row[NAME_KEYS[i]],
    hours: row[key],
  })).filter((p) => p.hours > 0);

  return (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipTitle}>{row.displayName}</Text>
      {people.map((p) => (
        <View key={p.slot} style={styles.tooltipRow}>
          <View style={styles.tooltipLeft}>
            <View style={[styles.swatch, { backgroundColor: p.color }]} />
            <Text style={[styles.tooltipName, p.slot === hoveredSlot && styles.bold]} numberOfLines={1}>
              {p.name}
            </Text>
          </View>
          <Text style={[styles.tooltipHours, p.slot === hoveredSlot && styles.bold]}>{p.hours}h</Text>
        </View>
      ))}
      <View style={styles.tooltipDivider} />
      <View style={styles.tooltipRow}>
        <Text style={[styles.tooltipName, styles.bold]}>Total</Text>
        <Text style={[styles.tooltipHours, styles.bold]}>{row.total}h</Text>
      </View>
    </View>
  );
}

function MobileBreakdown({ row, onOpen }: { row: ChartRow; onOpen: () => void }) {
  const people = PERSON_KEYS.map((key, i) => ({
    color: SEGMENT_COLORS[i],
    name: row[NAME_KEYS[i]],
    hours: row[key],
  })).filter((p) => p.hours > 0);

  return (
    <View style={styles.sheet}>
      <Text style={styles.sheetTitle}>{row.displayName}</Text>
      {people.map((p) => (
        <View key={p.name} style={styles.tooltipRow}>
          <View style={styles.tooltipLeft}>
            <View style={[styles.swatch, { backgroundColor: p.color }]} />
            <Text style={styles.tooltipName} numberOfLines={1}>
              {p.name}
            </Text>
          </View>
          <Text style={styles.tooltipHours}>{p.hours}h</Text>
        </View>
      ))}
      <View style={styles.tooltipDivider} />
      <View style={styles.tooltipRow}>
        <Text style={[styles.tooltipName, styles.bold]}>Total</Text>
        <Text style={[styles.tooltipHours, styles.bold]}>{row.total}h</Text>
      </View>
      <TextButton label="Open venture →" onPress={onOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  tooltip: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    gap: 4,
    minWidth: 180,
  },
  tooltipTitle: { fontFamily: fonts.bold, fontSize: 12, color: colors.text, marginBottom: 2 },
  tooltipRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  tooltipLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  tooltipName: { fontFamily: fonts.regular, fontSize: 12, color: colors.text, flexShrink: 1 },
  tooltipHours: { fontFamily: fonts.regular, fontSize: 12, color: colors.text },
  tooltipDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 2 },
  bold: { fontFamily: fonts.semibold },
  sheet: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
    gap: 6,
  },
  sheetTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.blueDeep },
});
