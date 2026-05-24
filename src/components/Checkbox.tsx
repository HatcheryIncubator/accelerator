import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/lib/theme';

type CheckboxProps = {
  checked: boolean;
  label: string;
  onToggle: () => void;
};

export function Checkbox({ checked, label, onToggle }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={styles.row}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <MaterialIcons name="check" size={16} color={colors.surface} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  label: {
    ...typography.subtext,
    color: colors.text,
    flex: 1,
  },
});
