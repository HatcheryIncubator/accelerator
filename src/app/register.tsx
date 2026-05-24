import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { VenturePicker } from '@/components/VenturePicker';
import { mockVentures } from '@/lib/mockData';
import { colors, typography } from '@/lib/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [ventureId, setVentureId] = useState<string | null>(null);

  function handleSubmit() {
    // TODO: wire to Supabase — create the participant record, then continue.
    router.push('/confirm');
  }

  return (
    <Screen title="Register" gap={12}>
      <Text style={styles.heading}>Tell us about you</Text>

      <TextField
        label="First name"
        placeholder="First name"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />
      <TextField
        label="Last name"
        placeholder="Last name"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />
      <TextField
        label="Email"
        placeholder="you@example.edu"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextField label="Your venture">
        <VenturePicker
          ventures={mockVentures}
          selectedId={ventureId}
          onSelect={setVentureId}
        />
      </TextField>

      <PrimaryButton label="Submit" onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...typography.heading,
    color: colors.blueDeep,
  },
});
