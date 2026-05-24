import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { DateTimeField } from '@/components/DateTimeField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextButton } from '@/components/TextButton';
import { TextField } from '@/components/TextField';
import { VenturePicker } from '@/components/VenturePicker';
import { mockVentures } from '@/lib/mockData';
import { colors, typography } from '@/lib/theme';

export default function AddSessionScreen() {
  const router = useRouter();
  const [ventureId, setVentureId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  function save() {
    // TODO: wire to Supabase — create a past session from these fields.
    router.push('/home');
  }

  return (
    <Screen title="Add a past session" gap={12}>
      <Text style={styles.subtext}>Log work you didn&apos;t check in for.</Text>

      <TextField label="Venture">
        <VenturePicker ventures={mockVentures} selectedId={ventureId} onSelect={setVentureId} />
      </TextField>

      <DateTimeField
        label="Started"
        date={startDate}
        time={startTime}
        onDateChange={setStartDate}
        onTimeChange={setStartTime}
      />
      <DateTimeField
        label="Ended"
        date={endDate}
        time={endTime}
        onDateChange={setEndDate}
        onTimeChange={setEndTime}
      />

      <PrimaryButton label="Save" onPress={save} />
      <TextButton label="Cancel" onPress={() => router.push('/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtext: {
    ...typography.subtext,
    color: colors.muted,
  },
});
