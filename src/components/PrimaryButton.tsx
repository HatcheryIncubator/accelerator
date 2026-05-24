import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, typography } from '@/lib/theme';
import type { PressableState } from '@/lib/pressable';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, hovered }: PressableState) => [
        styles.button,
        (pressed || (Platform.OS === 'web' && hovered)) && styles.active,
      ]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    borderRadius: radius,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: colors.blueDeep,
  },
  label: {
    ...typography.button,
    color: colors.surface,
  },
});
