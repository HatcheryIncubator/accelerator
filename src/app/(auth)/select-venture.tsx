import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { VenturePicker } from "@/components/VenturePicker";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, radius, typography } from "@/lib/theme";
import { useVentures } from "@/lib/useVentures";
import type { PressableState } from "@/lib/pressable";

export default function SelectVentureScreen() {
  const router = useRouter();
  const { session, refreshParticipant } = useAuth();
  const { ventures, loading: loadingVentures, error: venturesError } = useVentures();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const error = saveError ?? venturesError;

  async function onContinue() {
    if (!selectedId || !session) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { error: updateError } = await supabase
        .from("participants")
        .update({ venture_ids: [selectedId] })
        .eq("id", session.user.id);
      if (updateError) throw updateError;
      await refreshParticipant();
      router.replace("/home");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save your venture.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Pick your venture" showBack={false} gap={12}>
      <Text style={styles.subtext}>
        You&apos;ll log sessions against this venture. Contact an admin to change it later.
      </Text>

      {loadingVentures ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      ) : (
        <TextField label="Your venture">
          <VenturePicker ventures={ventures} selectedId={selectedId} onSelect={setSelectedId} />
        </TextField>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {saving ? (
        <View style={styles.submitBusy}>
          <ActivityIndicator color={colors.surface} />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={!selectedId}
          onPress={onContinue}
          style={({ pressed, hovered }: PressableState) => [
            styles.submit,
            !selectedId && styles.submitDisabled,
            selectedId &&
              (pressed || (Platform.OS === "web" && hovered)) &&
              styles.submitActive,
          ]}>
          <Text style={styles.submitLabel}>Continue</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtext: {
    ...typography.subtext,
    color: colors.muted,
  },
  loading: {
    paddingVertical: 24,
    alignItems: "center",
  },
  error: {
    ...typography.subtext,
    color: colors.error,
  },
  submit: {
    width: "100%",
    height: 56,
    borderRadius: radius,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  submitActive: {
    backgroundColor: colors.blueDeep,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitBusy: {
    width: "100%",
    height: 56,
    borderRadius: radius,
    backgroundColor: colors.blueDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  submitLabel: {
    ...typography.button,
    color: colors.surface,
  },
});
