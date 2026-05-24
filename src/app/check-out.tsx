import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { StatusCard } from '@/components/StatusCard';
import { TextButton } from '@/components/TextButton';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { formatDuration, formatTime } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { colors, radius, typography } from '@/lib/theme';
import type { SessionWithVenture } from '@/types';

export default function CheckOutScreen() {
  const router = useRouter();
  const { participant } = useAuth();

  const [openSession, setOpenSession] = useState<SessionWithVenture | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!participant) return;
      const { data } = await supabase
        .from('sessions')
        .select('*, ventures(name)')
        .eq('participant_id', participant.id)
        .is('check_out_at', null)
        .order('check_in_at', { ascending: false })
        .limit(1);
      if (!active) return;
      setOpenSession((data?.[0] as SessionWithVenture | undefined) ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [participant]);

  async function confirmCheckOut() {
    if (!openSession) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          check_out_at: new Date().toISOString(),
          notes: notes.trim() || null,
        })
        .eq('id', openSession.id);
      if (updateError) throw updateError;
      router.replace('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not check out.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Check Out">
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      ) : !openSession ? (
        <>
          <Text style={styles.subtext}>You don&apos;t have an open session.</Text>
          <PrimaryButton label="Back to home" onPress={() => router.replace('/home')} />
        </>
      ) : (
        <>
          <StatusCard
            title={openSession.ventures?.name ?? 'Your venture'}
            body={`Checked in at ${formatTime(openSession.check_in_at)}\nDuration: ${formatDuration(
              openSession.check_in_at,
              new Date().toISOString(),
            )}`}
          />
          <TextField
            label="What did you complete this session?"
            placeholder="Add a few notes about what you worked on…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.notesInput}
          />

          <Text style={styles.subtext}>
            Closing this session will record your check-out time as now.
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          {submitting ? (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.surface} />
            </View>
          ) : (
            <PrimaryButton label="Confirm Check Out" onPress={confirmCheckOut} />
          )}
          <TextButton label="Cancel" onPress={() => router.replace('/home')} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
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
