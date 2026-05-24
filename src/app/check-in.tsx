import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextButton } from '@/components/TextButton';
import { TextField } from '@/components/TextField';
import { VenturePicker } from '@/components/VenturePicker';
import { mockVentures } from '@/lib/mockData';
import { colors, radius, typography } from '@/lib/theme';
import type { PressableState } from '@/lib/pressable';

export default function CheckInScreen() {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const [ventureId, setVentureId] = useState<string | null>(null);

  function confirmCheckIn() {
    // TODO: wire to Supabase — open a new session for the selected venture.
    router.push('/home');
  }

  return (
    <Screen title="Check In">
      <Text style={styles.heading}>Working on Acme Co?</Text>
      <Text style={styles.subtext}>We&apos;ll start a session right now.</Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => setShowPicker((v) => !v)}
        style={({ pressed, hovered }: PressableState) => [
          styles.toggle,
          (pressed || (Platform.OS === 'web' && hovered)) && styles.toggleActive,
        ]}>
        <Text style={styles.toggleText}>＋ Working on a different venture?</Text>
      </Pressable>

      {showPicker && (
        <TextField label="Choose a venture">
          <VenturePicker
            ventures={mockVentures}
            selectedId={ventureId}
            onSelect={setVentureId}
          />
        </TextField>
      )}

      <PrimaryButton label="Confirm Check In" onPress={confirmCheckIn} />
      <TextButton label="Cancel" onPress={() => router.push('/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...typography.heading,
    color: colors.blueDeep,
  },
  subtext: {
    ...typography.subtext,
    color: colors.muted,
  },
  toggle: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#aaa',
    borderRadius: radius,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  toggleActive: {
    opacity: 0.7,
  },
  toggleText: {
    ...typography.subtext,
    color: colors.blueBright,
  },
});
