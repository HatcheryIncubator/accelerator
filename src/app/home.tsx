import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { StatusCard } from '@/components/StatusCard';
import { useUser } from '@/contexts/UserContext';
import { colors, typography } from '@/lib/theme';
import type { PressableState } from '@/lib/pressable';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // TODO: wire to Supabase — derive `isCheckedIn` from the open session, if any.

  function signOut() {
    // TODO: wire to Supabase — clear the session / sign out.
    router.replace('/');
  }

  const powerIcon = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      hitSlop={8}
      onPress={signOut}>
      <MaterialIcons name="power-settings-new" size={20} color={colors.surface} />
    </Pressable>
  );

  return (
    <Screen title={`Hi, ${user.firstName}`} showBack={false} headerRight={powerIcon}>
      {isCheckedIn ? (
        <>
          <StatusCard title="You're checked in" body="Acme Co · started at 2:30 PM" />
          <PrimaryButton label="Check Out" onPress={() => router.push('/check-out')} />
        </>
      ) : (
        <>
          <PrimaryButton label="Check In" onPress={() => router.push('/check-in')} />
          <SecondaryButton label="Add Session" onPress={() => router.push('/add-session')} />
          <SecondaryButton label="Edit Sessions" onPress={() => router.push('/edit-sessions')} />
        </>
      )}

      {__DEV__ && (
        <Pressable
          onPress={() => setIsCheckedIn((v) => !v)}
          style={({ pressed }: PressableState) => [styles.debug, pressed && styles.debugActive]}>
          <Text style={styles.debugText}>debug: toggle isCheckedIn (now {String(isCheckedIn)})</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  debug: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  debugActive: {
    opacity: 0.6,
  },
  debugText: {
    ...typography.subtext,
    fontSize: 12,
    color: colors.muted,
  },
});
