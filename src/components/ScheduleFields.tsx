import { StyleSheet, View } from 'react-native';

import { Checkbox } from './Checkbox';
import { DateInput, TimeInput } from './DateTimeInputs';
import { DateTimeField } from './DateTimeField';
import { TextField } from './TextField';

import type { ScheduleState } from '@/lib/schedule';

type ScheduleFieldsProps = ScheduleState & {
  onChange: (patch: Partial<ScheduleState>) => void;
};

export function ScheduleFields({
  multiDay,
  startDate,
  startTime,
  endDate,
  endTime,
  onChange,
}: ScheduleFieldsProps) {
  function toggleMultiDay() {
    onChange({
      multiDay: !multiDay,
      // Default the end date to the session date when switching to multi-day.
      endDate: !multiDay && !endDate ? startDate : endDate,
    });
  }

  return (
    <>
      <Checkbox
        checked={multiDay}
        label="Multi-day session (ends after midnight)"
        onToggle={toggleMultiDay}
      />

      {multiDay ? (
        <>
          <DateTimeField
            label="Started"
            date={startDate}
            time={startTime}
            onDateChange={(v) => onChange({ startDate: v })}
            onTimeChange={(v) => onChange({ startTime: v })}
          />
          <DateTimeField
            label="Ended"
            date={endDate}
            time={endTime}
            onDateChange={(v) => onChange({ endDate: v })}
            onTimeChange={(v) => onChange({ endTime: v })}
          />
        </>
      ) : (
        <>
          <TextField label="Session date">
            <DateInput value={startDate} onChange={(v) => onChange({ startDate: v })} />
          </TextField>
          <View style={styles.row}>
            <View style={styles.col}>
              <TextField label="Started">
                <TimeInput value={startTime} onChange={(v) => onChange({ startTime: v })} />
              </TextField>
            </View>
            <View style={styles.col}>
              <TextField label="Ended">
                <TimeInput value={endTime} onChange={(v) => onChange({ endTime: v })} />
              </TextField>
            </View>
          </View>
        </>
      )}
    </>
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
