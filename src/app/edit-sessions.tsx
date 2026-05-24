import { useRouter } from 'expo-router';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { mockSessions, type Session } from '@/lib/mockData';
import { colors, radius, typography } from '@/lib/theme';
import type { PressableState } from '@/lib/pressable';

export default function EditSessionsScreen() {
  const router = useRouter();

  // TODO: wire to Supabase — load this participant's sessions and open an editor on tap.

  function renderRow({ item }: { item: Session }) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/home')}
        style={({ pressed, hovered }: PressableState) => [
          styles.row,
          (pressed || (Platform.OS === 'web' && hovered)) && styles.rowActive,
        ]}>
        <Text style={styles.venture}>{item.ventureName}</Text>
        <Text style={styles.meta}>
          {item.date} · {item.duration}
        </Text>
      </Pressable>
    );
  }

  return (
    <Screen title="Your sessions" scroll={false} paddingHorizontal={24} paddingVertical={16} gap={8}>
      <Text style={styles.subtext}>Tap a session to edit.</Text>
      <FlatList
        data={mockSessions}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtext: {
    ...typography.subtext,
    color: colors.muted,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },
  row: {
    height: 88,
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 14,
    paddingLeft: 14,
  },
  rowActive: {
    backgroundColor: '#f8f8f7',
  },
  venture: {
    ...typography.button, // 18 / Semibold
    color: colors.blueDeep,
  },
  meta: {
    ...typography.subtext, // 16
    color: colors.muted,
  },
});
