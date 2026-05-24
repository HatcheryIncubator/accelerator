import { Fragment, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Polyline, Text as SvgText } from 'react-native-svg';

import type { CumulativePoint } from '@/lib/admin';
import { formatMinutes } from '@/lib/format';
import { colors, radius, typography } from '@/lib/theme';

const CHART_HEIGHT = 200;
const PAD = { top: 12, right: 12, bottom: 26, left: 40 };
const Y_SECTIONS = 4;
const X_LABELS = 5;

/** Round a max value up to a friendly axis ceiling (e.g. 6.2 -> 8, 23 -> 25). */
function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const step = pow <= 1 ? 1 : pow / 2;
  return Math.ceil(value / step) * step;
}

export function WorkTimeChart({ points }: { points: CumulativePoint[] }) {
  // Render SVG only after mount + once we've measured a width. This keeps the
  // web static-export prerender (which runs in Node) away from SVG internals.
  const [mounted, setMounted] = useState(false);
  const [width, setWidth] = useState(0);
  useEffect(() => setMounted(true), []);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const total = points.length ? points[points.length - 1].hours : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Total work time</Text>
        {points.length > 0 && <Text style={styles.total}>{formatMinutes(total * 60)}</Text>}
      </View>

      {points.length === 0 ? (
        <Text style={styles.muted}>No completed sessions yet.</Text>
      ) : (
        <View style={styles.plot} onLayout={onLayout}>
          {mounted && width > 0 ? (
            <Chart points={points} width={width} />
          ) : (
            <View style={{ height: CHART_HEIGHT }} />
          )}
        </View>
      )}
    </View>
  );
}

function Chart({ points, width }: { points: CumulativePoint[]; width: number }) {
  const innerW = Math.max(1, width - PAD.left - PAD.right);
  const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const maxY = niceCeil(Math.max(...points.map((p) => p.hours)));

  const x = (i: number) =>
    PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (hours: number) => PAD.top + innerH - (hours / maxY) * innerH;

  const linePoints = points.map((p, i) => `${x(i)},${y(p.hours)}`).join(' ');
  // Area polygon: line, then back along the baseline.
  const areaPoints = `${PAD.left},${PAD.top + innerH} ${linePoints} ${PAD.left + innerW},${PAD.top + innerH}`;

  const yTicks = Array.from({ length: Y_SECTIONS + 1 }, (_, k) => (maxY * k) / Y_SECTIONS);
  const xStep = Math.max(1, Math.round((points.length - 1) / (X_LABELS - 1)));
  const xLabelIdx = points
    .map((_, i) => i)
    .filter((i) => i % xStep === 0 || i === points.length - 1);

  return (
    <Svg width={width} height={CHART_HEIGHT}>
      {/* Horizontal gridlines + y labels */}
      {yTicks.map((t, k) => {
        const yy = y(t);
        return (
          <Fragment key={`y-${k}`}>
            <Line x1={PAD.left} y1={yy} x2={PAD.left + innerW} y2={yy} stroke="#eee" strokeWidth={1} />
            <SvgText x={PAD.left - 6} y={yy + 4} fontSize={11} fill={colors.muted} textAnchor="end">
              {`${Number.isInteger(t) ? t : t.toFixed(1)}h`}
            </SvgText>
          </Fragment>
        );
      })}

      <Polygon points={areaPoints} fill={colors.blueBright} fillOpacity={0.08} />
      <Polyline
        points={linePoints}
        fill="none"
        stroke={colors.blueBright}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.length === 1 && <Circle cx={x(0)} cy={y(points[0].hours)} r={3} fill={colors.blueBright} />}

      {/* X labels */}
      {xLabelIdx.map((i) => (
        <SvgText
          key={`x-${i}`}
          x={x(i)}
          y={CHART_HEIGHT - 8}
          fontSize={11}
          fill={colors.muted}
          textAnchor="middle">
          {points[i].label}
        </SvgText>
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: { ...typography.fieldLabel, color: colors.blueDeep },
  total: { ...typography.heading, fontSize: 20, color: colors.blueBright },
  muted: { ...typography.subtext, color: colors.muted },
  plot: { width: '100%' },
});
