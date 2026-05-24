import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { HeaderActions } from './HeaderActions';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { StatusCard } from '@/components/StatusCard';
import { useAuth } from '@/contexts/AuthContext';
import { formatTime } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { colors } from '@/lib/theme';
import type { SessionWithVenture } from '@/lib/types';

export function ParticipantHome() {
  const router = useRouter();
  const { participant } = useAuth();
  const [openSession, setOpenSession] = useState<SessionWithVenture | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!participant) return;
    setLoading(true);
    const { data } = await supabase
      .from('sessions')
      .select('*, ventures(name)')
      .eq('participant_id', participant.id)
      .is('check_out_at', null)
      .order('check_in_at', { ascending: false })
      .limit(1);
    setOpenSession((data?.[0] as SessionWithVenture | undefined) ?? null);
    setLoading(false);
  }, [participant]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <Screen title={`Hi, ${participant?.first_name ?? ''}`} showBack={false} headerRight={<HeaderActions />}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      ) : openSession ? (
        <>
          <StatusCard
            title="You're checked in"
            body={`${openSession.ventures?.name ?? 'Your venture'} · started at ${formatTime(openSession.check_in_at)}`}
          />
          <PrimaryButton label="Check Out" onPress={() => router.push('/check-out')} />
        </>
      ) : (
        <>
          <PrimaryButton label="Check In" onPress={() => router.push('/check-in')} />
          <SecondaryButton label="Add Session" onPress={() => router.push('/add-session')} />
          <SecondaryButton label="View Sessions" onPress={() => router.push('/edit-sessions')} />
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
});
