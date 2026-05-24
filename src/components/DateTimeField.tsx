import { StyleSheet, View } from 'react-native';

import { DateInput, TimeInput } from './DateTimeInputs';
import { TextField } from './TextField';

type DateTimeFieldProps = {
  label: string;
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
};

/** A labeled row with a date input and a time input side by side. */
export function DateTimeField({ label, date, time, onDateChange, onTimeChange }: DateTimeFieldProps) {
  return (
    <TextField label={label}>
      <View style={styles.row}>
        <View style={styles.col}>
          <DateInput value={date} onChange={onDateChange} />
        </View>
        <View style={styles.col}>
          <TimeInput value={time} onChange={onTimeChange} />
        </View>
      </View>
    </TextField>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  col: {
    flex: 1,
  },
});
