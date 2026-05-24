import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { colors, typography } from '@/lib/theme';
import type { PressableState } from '@/types';

type TextButtonProps = {
  label: string;
  onPress?: () => void;
};

export function TextButton({ label, onPress }: TextButtonProps) {
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
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  active: {
    opacity: 0.7,
  },
  label: {
    ...typography.subtext,
    color: colors.blue,
    textDecorationLine: 'underline',
  },
});
