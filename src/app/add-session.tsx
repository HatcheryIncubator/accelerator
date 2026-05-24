import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ScheduleFields } from '@/components/ScheduleFields';
import { Screen } from '@/components/Screen';
import { TextButton } from '@/components/TextButton';
import { TextField } from '@/components/TextField';
import { VenturePicker } from '@/components/VenturePicker';
import { useAuth } from '@/contexts/AuthContext';
import { buildSchedule, emptySchedule, type ScheduleState } from '@/lib/schedule';
import { supabase } from '@/lib/supabase';
import { colors, radius, typography } from '@/lib/theme';

export default function AddSessionScreen() {
  const router = useRouter();
  const { participant, participantVentures } = useAuth();

  // Auto-select the venture when the participant only works on one.
  const [ventureId, setVentureId] = useState<string | null>(
    participantVentures.length === 1 ? participantVentures[0].id : null,
  );
  const [schedule, setSchedule] = useState<ScheduleState>(emptySchedule);

  useEffect(() => {
    if (participantVentures.length === 1 && !ventureId) {
      setVentureId(participantVentures[0].id);
    }
  }, [participantVentures, ventureId]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patchSchedule(patch: Partial<ScheduleState>) {
    setSchedule((s) => ({ ...s, ...patch }));
  }

  async function save() {
    setError(null);
    if (!participant) return;
    if (!ventureId) {
      setError('Please choose a venture.');
      return;
    }
    const { checkIn, checkOut } = buildSchedule(schedule);
    if (!checkIn) {
      setError('Please enter a valid session date and start time.');
      return;
    }
    if (!checkOut) {
      setError('Please enter a valid end time.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('The end time must be after the start time. For overnight work, tick “Multi-day”.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('sessions').insert({
        participant_id: participant.id,
        venture_id: ventureId,
        check_in_at: checkIn,
        check_out_at: checkOut,
      });
      if (insertError) throw insertError;
      router.replace('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the session.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Add a past session" gap={12}>
      <Text style={styles.subtext}>Log work you didn&apos;t check in for.</Text>

      <TextField label="Venture">
        <VenturePicker
          ventures={participantVentures}
          selectedId={ventureId}
          onSelect={setVentureId}
        />
      </TextField>

      <ScheduleFields {...schedule} onChange={patchSchedule} />

      {error && <Text style={styles.error}>{error}</Text>}

      {submitting ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.surface} />
        </View>
      ) : (
        <PrimaryButton label="Save" onPress={save} />
      )}
      <TextButton label="Cancel" onPress={() => router.replace('/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtext: {
    ...typography.subtext,
    color: colors.muted,
  },
  error: {
    ...typography.subtext,
    color: colors.error,
  },
  busy: {
    width: '100%',
    height: 56,
    borderRadius: radius,
    backgroundColor: colors.blueDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
