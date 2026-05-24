import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ScheduleFields } from '@/components/ScheduleFields';
import { Screen } from '@/components/Screen';
import { TextButton } from '@/components/TextButton';
import { TextField } from '@/components/TextField';
import { VenturePicker } from '@/components/VenturePicker';
import { useAuth } from '@/contexts/AuthContext';
import { buildSchedule, emptySchedule, scheduleFromSession, type ScheduleState } from '@/lib/schedule';
import { supabase } from '@/lib/supabase';
import { colors, radius, typography } from '@/lib/theme';
import type { Venture } from '@/lib/types';

export default function EditSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { participantVentures } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ventureId, setVentureId] = useState<string | null>(null);
  const [sessionVenture, setSessionVenture] = useState<Venture | null>(null);
  const [schedule, setSchedule] = useState<ScheduleState>(emptySchedule);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Options are the participant's ventures, plus this session's current venture
  // even if they no longer work on it (so it still displays/saves correctly).
  const ventureOptions =
    sessionVenture && !participantVentures.some((v) => v.id === sessionVenture.id)
      ? [...participantVentures, sessionVenture]
      : participantVentures;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/edit-sessions');
  }

  function patchSchedule(patch: Partial<ScheduleState>) {
    setSchedule((s) => ({ ...s, ...patch }));
  }

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id) return;
      const { data } = await supabase
        .from('sessions')
        .select('*, ventures(id, name)')
        .eq('id', id)
        .maybeSingle();
      if (!active) return;
      if (!data) {
        setNotFound(true);
      } else {
        setVentureId(data.venture_id);
        const v = (data as { ventures: Venture | null }).ventures;
        if (v) setSessionVenture({ id: String(v.id), name: v.name });
        setSchedule(scheduleFromSession(data.check_in_at, data.check_out_at));
        setNotes(data.notes ?? '');
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  async function save() {
    setError(null);
    if (!ventureId) {
      setError('Please choose a venture.');
      return;
    }
    const { checkIn, checkOut } = buildSchedule(schedule);
    if (!checkIn) {
      setError('Please enter a valid session date and start time.');
      return;
    }
    // End is optional — leaving the end time blank keeps the session open.
    if (schedule.endTime && !checkOut) {
      setError('Please enter a valid end time.');
      return;
    }
    if (checkOut && new Date(checkOut) <= new Date(checkIn)) {
      setError('The end time must be after the start time. For overnight work, tick “Multi-day”.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          venture_id: ventureId,
          check_in_at: checkIn,
          check_out_at: checkOut,
          notes: notes.trim() || null,
        })
        .eq('id', id);
      if (updateError) throw updateError;
      goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the session.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Edit session" gap={12}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      ) : notFound ? (
        <>
          <Text style={styles.subtext}>This session could not be found.</Text>
          <PrimaryButton label="Back" onPress={() => goBack()} />
        </>
      ) : (
        <>
          <TextField label="Venture">
            <VenturePicker
              ventures={ventureOptions}
              selectedId={ventureId}
              onSelect={setVentureId}
            />
          </TextField>

          <ScheduleFields {...schedule} onChange={patchSchedule} />

          <TextField
            label="Notes"
            placeholder="What did you work on this session?"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.notesInput}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          {submitting ? (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.surface} />
            </View>
          ) : (
            <PrimaryButton label="Save changes" onPress={save} />
          )}
          <TextButton label="Cancel" onPress={() => goBack()} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  subtext: {
    ...typography.subtext,
    color: colors.muted,
  },
  notesInput: {
    height: 110,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
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
