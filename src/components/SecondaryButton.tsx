import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, typography } from '@/lib/theme';
import type { PressableState } from '@/types';

type SecondaryButtonProps = {
  label: string;
  onPress?: () => void;
};

export function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
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
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: '#f4f4f3',
  },
  label: {
    ...typography.button,
    color: colors.blue,
  },
});
