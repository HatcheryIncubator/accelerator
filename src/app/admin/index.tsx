import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActivityHeatmap } from '@/components/admin/ActivityHeatmap';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { HereNowCard } from '@/components/admin/HereNowCard';
import { HoursByVentureChart } from '@/components/admin/HoursByVentureChart';
import { KpiTile } from '@/components/admin/KpiTile';
import { QuietParticipantsCard } from '@/components/admin/QuietParticipantsCard';
import { SessionsPerWeekChart } from '@/components/admin/SessionsPerWeekChart';
import { useAdminDashboard, RANGE_LABELS, type AdminDashboardData, type DateRange } from '@/hooks/useAdminDashboard';
import { useBreakpoint, type Breakpoint } from '@/hooks/useBreakpoint';
import { colors, radius, typography } from '@/lib/theme';

export default function AdminDashboard() {
  const [range, setRange] = useState<DateRange>('cohort');
  const { breakpoint } = useBreakpoint();
  const data = useAdminDashboard(range);
  const isMobile = breakpoint === 'mobile';

  return (
    <View style={styles.root}>
      <AdminHeader range={range} onRangeChange={setRange} compact={isMobile} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.body}>
          {data.error ? <Text style={styles.error}>{data.error}</Text> : null}
          {data.loading ? (
            <DashboardSkeleton breakpoint={breakpoint} />
          ) : (
            <DashboardContent data={data} range={range} breakpoint={breakpoint} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function KpiStrip({ data, mobile }: { data: AdminDashboardData; mobile: boolean }) {
  const { kpis } = data;
  const active = `${kpis.activeVentures.active} / ${kpis.activeVentures.total}`;
  if (mobile) {
    // "Checked in now" is the hero card on mobile, so the strip is a 3-up mini row.
    return (
      <View style={styles.kpiRow}>
        <KpiTile label="Participants" value={kpis.participants} minWidth={96} />
        <KpiTile label="Avg hrs/wk per venture" value={`${kpis.avgWeeklyHoursPerVenture}h`} minWidth={96} />
        <KpiTile label="Active ventures" value={active} minWidth={96} />
      </View>
    );
  }
  return (
    <View style={styles.kpiRow}>
      <KpiTile label="Participants" value={kpis.participants} />
      <KpiTile label="Avg hrs/wk per venture" value={`${kpis.avgWeeklyHoursPerVenture}h`} hint="target ~40h" />
      <KpiTile label="Checked in now" value={kpis.checkedInNow} tone="active" />
      <KpiTile label="Active ventures" value={active} />
    </View>
  );
}

function DashboardContent({
  data,
  range,
  breakpoint,
}: {
  data: AdminDashboardData;
  range: DateRange;
  breakpoint: Breakpoint;
}) {
  const hoursTitle = `Hours by venture · ${RANGE_LABELS[range]}`;

  if (breakpoint === 'mobile') {
    return (
      <>
        <HereNowCard items={data.hereNow} hero />
        <KpiStrip data={data} mobile />
        <QuietParticipantsCard items={data.quiet} collapsed />
        <HoursByVentureChart title={hoursTitle} data={data.hoursByVenture} breakpoint={breakpoint} />
        <SessionsPerWeekChart data={data.sessionsPerWeek} />
        <ActivityHeatmap data={data.heatmap} compact />
      </>
    );
  }

  if (breakpoint === 'tablet') {
    return (
      <>
        <KpiStrip data={data} mobile={false} />
        <HereNowCard items={data.hereNow} />
        <HoursByVentureChart title={hoursTitle} data={data.hoursByVenture} breakpoint={breakpoint} />
        <SessionsPerWeekChart data={data.sessionsPerWeek} />
        <ActivityHeatmap data={data.heatmap} />
        <QuietParticipantsCard items={data.quiet} />
      </>
    );
  }

  // Desktop: KPI strip, then people column (left) + charts column (right).
  return (
    <>
      <KpiStrip data={data} mobile={false} />
      <View style={styles.twoCol}>
        <View style={styles.sideCol}>
          <HereNowCard items={data.hereNow} />
          <QuietParticipantsCard items={data.quiet} />
        </View>
        <View style={styles.mainCol}>
          <HoursByVentureChart title={hoursTitle} data={data.hoursByVenture} breakpoint={breakpoint} />
          <View style={styles.subGrid}>
            <View style={styles.subCell}>
              <ActivityHeatmap data={data.heatmap} />
            </View>
            <View style={styles.subCell}>
              <SessionsPerWeekChart data={data.sessionsPerWeek} />
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

function Sk({ height, style }: { height: number; style?: object }) {
  return <View style={[styles.sk, { height }, style]} />;
}

function DashboardSkeleton({ breakpoint }: { breakpoint: Breakpoint }) {
  const tiles = breakpoint === 'mobile' ? 3 : 4;
  return (
    <>
      <View style={styles.kpiRow}>
        {Array.from({ length: tiles }).map((_, i) => (
          <Sk key={i} height={76} style={{ flex: 1, minWidth: breakpoint === 'mobile' ? 96 : 160 }} />
        ))}
      </View>
      <Sk height={280} />
      <Sk height={220} />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bodyBg },
  scroll: { flexGrow: 1, padding: 16 },
  body: { width: '100%', maxWidth: 1200, alignSelf: 'center', gap: 16 },
  error: { ...typography.subtext, color: colors.error },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  twoCol: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  sideCol: { flex: 1, gap: 16 },
  mainCol: { flex: 2, gap: 16 },
  subGrid: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  subCell: { flex: 1 },
  sk: { backgroundColor: '#ececec', borderRadius: radius, width: '100%' },
});
