import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { TextField } from './TextField';

import { colors, radius } from '@/lib/theme';

type DateTimeFieldProps = {
  label: string;
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
};

/**
 * A labeled row with a date input and a time input side by side.
 * Web uses native HTML <input type="date"|"time"> (mouse + keyboard friendly,
 * and they render real platform pickers). Native falls back to placeholder
 * text fields.
 * TODO: add native datetime picker (do NOT use @react-native-community/datetimepicker — mobile-only).
 */
export function DateTimeField({ label, date, time, onDateChange, onTimeChange }: DateTimeFieldProps) {
  return (
    <TextField label={label}>
      <View style={styles.row}>
        {Platform.OS === 'web' ? (
          <>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange((e.target as HTMLInputElement).value)}
              style={webInputStyle}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => onTimeChange((e.target as HTMLInputElement).value)}
              style={webInputStyle}
            />
          </>
        ) : (
          <>
            <TextInput
              style={styles.nativeInput}
              placeholder="Date"
              placeholderTextColor={colors.muted}
              value={date}
              onChangeText={onDateChange}
            />
            <TextInput
              style={styles.nativeInput}
              placeholder="Time"
              placeholderTextColor={colors.muted}
              value={time}
              onChangeText={onTimeChange}
            />
          </>
        )}
      </View>
    </TextField>
  );
}

const webInputStyle = {
  flex: 1,
  minWidth: 0,
  height: 52,
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  nativeInput: {
    flex: 1,
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
