import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card } from './Card';
import type { SessionsPerWeekChartProps } from './chartTypes';

import { colors } from '@/lib/theme';

const CHART_HEIGHT = 220;

export function SessionsPerWeekChart({ data }: SessionsPerWeekChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card title="Sessions per week">
      {!mounted ? (
        <View style={{ height: CHART_HEIGHT }} />
      ) : (
        <View style={{ width: '100%', height: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: colors.muted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: colors.muted }}
                axisLine={false}
                tickLine={false}
                width={28}
                allowDecimals={false}
              />
              <Tooltip cursor={{ fill: colors.bodyBg }} />
              <Bar dataKey="count" fill={colors.chartBarLight} barSize={18} radius={[3, 3, 0, 0]} isAnimationActive={false} />
              <Line
                type="monotone"
                dataKey="avg"
                stroke={colors.chartBar}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </View>
      )}
    </Card>
  );
}
