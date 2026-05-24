import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { TextField } from '@/components/TextField';
import { colors, typography } from '@/lib/theme';

export default function LookupScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  // TODO: wire to Supabase — search participants by name using `query`.

  return (
    <Screen title="Hatchery Check-In" showBack={false}>
      <Text style={styles.welcome}>Welcome 👋</Text>
      <Text style={styles.subtext}>Find your name to get started.</Text>

      <TextField
        label="Your name"
        placeholder="Search by name…"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="words"
      />

      <PrimaryButton label="Continue" onPress={() => router.push('/confirm')} />

      <View style={styles.dividerRow}>
        <Text style={styles.divider}>— or —</Text>
      </View>

      <SecondaryButton label="I'm new here →" onPress={() => router.push('/register')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcome: {
    ...typography.display,
    color: colors.blueDeep,
  },
  subtext: {
    ...typography.subtext,
    color: colors.muted,
  },
  dividerRow: {
    alignItems: 'center',
  },
  divider: {
    ...typography.subtext,
    color: colors.muted,
  },
});
