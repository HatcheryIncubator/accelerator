import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RangePicker } from './RangePicker';

import type { DateRange } from '@/hooks/useAdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { colors, fonts, radius, typography } from '@/lib/theme';

export function AdminHeader({
  range,
  onRangeChange,
  compact = false,
}: {
  range: DateRange;
  onRangeChange: (r: DateRange) => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const { participant, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <View style={styles.left}>
          <View style={styles.logo}>
            <MaterialIcons name="local-fire-department" size={18} color={colors.surface} />
          </View>
          {!compact && <Text style={styles.brand}>The Hatchery</Text>}
          <Text style={styles.title} numberOfLines={1}>
            Admin · {participant?.first_name ?? ''}
          </Text>
        </View>
        <View style={styles.right}>
          <RangePicker value={range} onChange={onRangeChange} />
          <Pressable accessibilityRole="button" accessibilityLabel="Profile" hitSlop={8} onPress={() => router.push('/profile')}>
            <MaterialIcons name="person" size={20} color={colors.surface} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Sign out" hitSlop={8} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={18} color={colors.surface} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.blue,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inner: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  logo: {
    width: 28,
    height: 28,
    borderRadius: radius,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: colors.surface, fontFamily: fonts.bold, fontSize: 16 },
  title: { ...typography.subtext, fontSize: 14, color: colors.surface, opacity: 0.85, flexShrink: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});
