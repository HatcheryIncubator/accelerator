import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card } from './Card';
import type { HoursByVentureChartProps } from './chartTypes';

import { TextButton } from '@/components/TextButton';
import { colors } from '@/lib/theme';

const MIN_HEIGHT = 260;
const ROW_PX = 26;

export function HoursByVentureChart({ data, title, mobile = false }: HoursByVentureChartProps) {
  // Mounted gate: effects don't run during the Node static-export prerender, so
  // only the fixed-height placeholder is emitted; recharts mounts after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouter();

  const rows = mobile ? data.slice(0, 5) : data;
  const height = Math.max(MIN_HEIGHT, rows.length * ROW_PX);

  return (
    <Card title={title}>
      {!mounted ? (
        <View style={{ height }} />
      ) : (
        <View style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: colors.muted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11, fill: colors.muted }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(v: number) => [`${v}h`, 'Hours']} cursor={{ fill: colors.bodyBg }} />
              <Bar
                dataKey="hours"
                barSize={14}
                radius={[0, 3, 3, 0]}
                cursor="pointer"
                isAnimationActive={false}
                onClick={(_, index) => {
                  const v = rows[index];
                  if (v) router.push({ pathname: '/admin/venture/[id]', params: { id: v.ventureId } });
                }}>
                {rows.map((r) => (
                  <Cell key={r.ventureId} fill={colors.chartBar} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </View>
      )}
      {mobile && data.length > rows.length && (
        <TextButton label={`Show all ${data.length}`} onPress={() => router.push('/admin/ventures')} />
      )}
    </Card>
  );
}
