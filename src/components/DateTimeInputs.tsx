import { useId } from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';

import { colors, radius } from '@/lib/theme';

// Web: native HTML inputs (real platform pickers, keyboard-accessible).
// Native: placeholder text inputs.
// TODO: add native date/time pickers (do NOT use @react-native-community/datetimepicker — mobile-only).

type InputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DateInput({ value, onChange }: InputProps) {
  const id = useId();
  if (Platform.OS === 'web') {
    return (
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
        style={webInputStyle}
      />
    );
  }
  return (
    <TextInput
      style={styles.native}
      placeholder="YYYY-MM-DD"
      placeholderTextColor={colors.muted}
      value={value}
      onChangeText={onChange}
    />
  );
}

export function TimeInput({ value, onChange }: InputProps) {
  const id = useId();
  if (Platform.OS === 'web') {
    return (
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
        style={webInputStyle}
      />
    );
  }
  return (
    <TextInput
      style={styles.native}
      placeholder="HH:MM"
      placeholderTextColor={colors.muted}
      value={value}
      onChangeText={onChange}
    />
  );
}

const webInputStyle = {
  width: '100%',
  minWidth: 0,
  height: 52,
  boxSizing: 'border-box',
  border: `1px solid ${colors.border}`,
  borderRadius: radius,
  padding: '0 14px',
  fontSize: 18,
  fontFamily: 'OpenSans_400Regular',
  color: colors.text,
  backgroundColor: colors.surface,
  outline: 'none',
} as const;

const styles = StyleSheet.create({
  native: {
    width: '100%',
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: 14,
    fontFamily: 'OpenSans_400Regular',
    fontSize: 18,
    color: colors.text,
  },
});
