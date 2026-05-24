import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Checkbox } from '@/components/Checkbox';
import { DisplayCard } from '@/components/DisplayCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextButton } from '@/components/TextButton';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, radius, typography } from '@/lib/theme';
import { useVentures } from '@/lib/useVentures';

export default function ProfileScreen() {
  const router = useRouter();
  const { participant, participantVentures, refreshParticipant } = useAuth();
  const { ventures, loading: loadingVentures } = useVentures();

  const [firstName, setFirstName] = useState(participant?.first_name ?? '');
  const [lastName, setLastName] = useState(participant?.last_name ?? '');
  const [selectedVentureIds, setSelectedVentureIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep fields in sync if the participant / ventures load after mount.
  useEffect(() => {
    setFirstName(participant?.first_name ?? '');
    setLastName(participant?.last_name ?? '');
  }, [participant?.first_name, participant?.last_name]);

  useEffect(() => {
    setSelectedVentureIds(participantVentures.map((v) => v.id));
  }, [participantVentures]);

  function toggleVenture(id: string) {
    setSelectedVentureIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  async function save() {
    setError(null);
    if (!participant) return;
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    if (selectedVentureIds.length === 0) {
      setError('Select at least one venture.');
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('participants')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          venture_ids: selectedVentureIds,
        })
        .eq('id', participant.id);
      if (updateError) throw updateError;

      await refreshParticipant();
      goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Profile" gap={12}>
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
      <Text style={styles.note}>Your email is your sign-in.</Text>

      <Text style={styles.sectionLabel}>Your ventures</Text>
      <Text style={styles.note}>Select every venture you&apos;re working on.</Text>
      {loadingVentures ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.blue} />
        </View>
      ) : (
        <View style={styles.list}>
          {ventures.map((v) => (
            <Checkbox
              key={v.id}
              label={v.name}
              checked={selectedVentureIds.includes(v.id)}
              onToggle={() => toggleVenture(v.id)}
            />
          ))}
        </View>
      )}

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
  sectionLabel: {
    ...typography.fieldLabel,
    color: colors.muted,
    marginTop: 4,
  },
  list: {
    gap: 4,
  },
  loading: {
    paddingVertical: 12,
    alignItems: 'center',
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
