import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { StatusCard } from '@/components/StatusCard';
import { TextButton } from '@/components/TextButton';
import { colors, typography } from '@/lib/theme';

export default function CheckOutScreen() {
  const router = useRouter();

  // TODO: wire to Supabase — load the open session; close it on confirm.

  function confirmCheckOut() {
    // TODO: wire to Supabase — record check-out time as now.
    router.push('/home');
  }

  return (
    <Screen title="Check Out">
      <StatusCard title="Acme Co" body={'Checked in at 2:30 PM\nDuration: 1h 15m'} />

      <Text style={styles.subtext}>
        Closing this session will record your check-out time as now.
      </Text>

      <PrimaryButton label="Confirm Check Out" onPress={confirmCheckOut} />
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
