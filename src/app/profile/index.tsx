import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { colors, radius, typography } from '@/lib/theme';
import type { PressableState } from '@/lib/pressable';

export default function ProfileScreen() {
  const router = useRouter();
  const { participant, participantVentures } = useAuth();

  const name = `${participant?.first_name ?? ''} ${participant?.last_name ?? ''}`.trim();
  const ventureCount = participantVentures.length;

  return (
    <Screen title="Profile" gap={12}>
      <SectionRow
        title="Basic information"
        subtitle={name || 'Name and email'}
        onPress={() => router.push('/profile/basic')}
      />
      <SectionRow
        title="Account"
        subtitle="Password and account"
        onPress={() => router.push('/profile/account')}
      />
      <SectionRow
        title="Your ventures"
        subtitle={`${ventureCount} ${ventureCount === 1 ? 'venture' : 'ventures'}`}
        onPress={() => router.push('/profile/ventures')}
      />
    </Screen>
  );
}

function SectionRow({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed, hovered }: PressableState) => [
        styles.row,
        (pressed || (Platform.OS === 'web' && hovered)) && styles.rowActive,
      ]}>
      <View style={styles.rowText}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  rowActive: {
    backgroundColor: '#f8f8f7',
  },
  rowText: {
    gap: 2,
  },
  title: {
    ...typography.button,
    color: colors.blueDeep,
  },
  subtitle: {
    ...typography.subtext,
    fontSize: 14,
    color: colors.muted,
  },
});
