import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { useVentures } from '@/hooks/useVentures';
import { colors, radius, typography } from '@/lib/theme';
import type { PressableState } from '@/types';

export default function AdminVenturesScreen() {
  const router = useRouter();
  const { ventures, loading } = useVentures();

  return (
    <Screen title="Ventures" gap={10}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.blue} />
        </View>
      ) : (
        ventures.map((v) => (
          <Pressable
            key={v.id}
            accessibilityRole="button"
            accessibilityLabel={`${v.name} stats`}
            onPress={() => router.push({ pathname: '/admin/venture/[id]', params: { id: v.id } })}
            style={({ pressed, hovered }: PressableState) => [
              styles.row,
              (pressed || (Platform.OS === 'web' && hovered)) && styles.rowActive,
            ]}>
            <Text style={styles.name}>{v.name}</Text>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: 24, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  rowActive: { backgroundColor: '#f8f8f7' },
  name: { ...typography.button, color: colors.blueDeep },
});
