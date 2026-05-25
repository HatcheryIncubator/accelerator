import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextButton } from '@/components/TextButton';
import { TextField } from '@/components/TextField';
import { VenturePicker } from '@/components/VenturePicker';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, radius, typography } from '@/lib/theme';

export default function CheckInScreen() {
  const router = useRouter();
  const { participant, participantVentures } = useAuth();

  const multiple = participantVentures.length > 1;
  const [ventureId, setVentureId] = useState<string | null>(participantVentures[0]?.id ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = multiple
    ? 'Which venture are you working on?'
    : `Working on ${participantVentures[0]?.name ?? 'your venture'}?`;

  async function confirmCheckIn() {
    const effectiveVentureId = ventureId ?? participantVentures[0]?.id;
    if (!participant || !effectiveVentureId) {
      setError('Please choose a venture.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('sessions').insert({
        participant_id: participant.id,
        venture_id: effectiveVentureId,
        check_in_at: new Date().toISOString(),
      });
      if (insertError) throw insertError;
      router.replace('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not check in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Check In">
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.subtext}>We&apos;ll start a session right now.</Text>

      {multiple && (
        <TextField label="Venture">
          <VenturePicker
            ventures={participantVentures}
            selectedId={ventureId}
            onSelect={setVentureId}
          />
        </TextField>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {submitting ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.surface} />
        </View>
      ) : (
        <PrimaryButton label="Confirm Check In" onPress={confirmCheckIn} />
      )}
      <TextButton label="Cancel" onPress={() => router.replace('/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...typography.heading,
    color: colors.gold, // Emory gold H1
  },
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
