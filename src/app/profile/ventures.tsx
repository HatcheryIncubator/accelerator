import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Checkbox } from '@/components/Checkbox';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextButton } from '@/components/TextButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, radius, typography } from '@/lib/theme';
import { useVentures } from '@/lib/useVentures';

export default function VenturesScreen() {
  const router = useRouter();
  const { participant, participantVentures, refreshParticipant } = useAuth();
  const { ventures, loading: loadingVentures } = useVentures();

  const [selectedVentureIds, setSelectedVentureIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    else router.replace('/profile');
  }

  async function save() {
    setError(null);
    if (!participant) return;
    if (selectedVentureIds.length === 0) {
      setError('Select at least one venture.');
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('participants')
        .update({ venture_ids: selectedVentureIds })
        .eq('id', participant.id);
      if (updateError) throw updateError;

      await refreshParticipant();
      goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your ventures.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Your ventures" gap={12}>
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
