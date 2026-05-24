import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { DisplayCard } from '@/components/DisplayCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { useUser } from '@/contexts/UserContext';
import { colors, typography } from '@/lib/theme';

export default function ConfirmScreen() {
  const router = useRouter();
  const { user } = useUser();

  // TODO: wire to Supabase — these values come from the matched participant.

  return (
    <Screen title="Confirm details" gap={12}>
      <Text style={styles.heading}>Is this you?</Text>

      <DisplayCard label="Name" value={`${user.firstName} ${user.lastName}`} />
      <DisplayCard label="Email" value={user.email} />
      <DisplayCard label="Venture" value={user.ventureName} />

      <PrimaryButton label="Yes, that's me" onPress={() => router.push('/home')} />
      <SecondaryButton label="No, go back" onPress={() => router.push('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...typography.heading,
    color: colors.blueDeep,
  },
});
