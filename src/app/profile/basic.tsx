import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { DisplayCard } from '@/components/DisplayCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextButton } from '@/components/TextButton';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, radius, typography } from '@/lib/theme';

export default function BasicInfoScreen() {
  const router = useRouter();
  const { participant, refreshParticipant } = useAuth();

  const [firstName, setFirstName] = useState(participant?.first_name ?? '');
  const [lastName, setLastName] = useState(participant?.last_name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync if the participant resolves after mount.
  useEffect(() => {
    setFirstName(participant?.first_name ?? '');
    setLastName(participant?.last_name ?? '');
  }, [participant?.first_name, participant?.last_name]);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/profile');
  }

  async function save() {
    setError(null);
    if (!participant) return;
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('participants')
        .update({ first_name: firstName.trim(), last_name: lastName.trim() })
        .eq('id', participant.id);
      if (updateError) throw updateError;

      await refreshParticipant();
      goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Basic information" gap={12}>
      <TextField
        label="First name"
        placeholder="First name"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
        textContentType="givenName"
      />
      <TextField
        label="Last name"
        placeholder="Last name"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
        textContentType="familyName"
      />

      <DisplayCard label="Email" value={participant?.email ?? '—'} />
      <Text style={styles.note}>Your email is your sign-in and can&apos;t be changed here.</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {saving ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.surface} />
        </View>
      ) : (
        <PrimaryButton label="Save changes" onPress={save} />
      )}
      <TextButton label="Cancel" onPress={goBack} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
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
