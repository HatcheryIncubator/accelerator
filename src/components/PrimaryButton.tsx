import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, typography } from '@/lib/theme';
import type { PressableState } from '@/types';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={({ pressed, hovered }: PressableState) => [
        styles.button,
        !disabled && (pressed || (Platform.OS === 'web' && hovered)) && styles.active,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
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
  disabled: {
    backgroundColor: colors.border,
  },
  label: {
    ...typography.button,
    color: colors.surface,
  },
  labelDisabled: {
    color: colors.muted,
  },
});
