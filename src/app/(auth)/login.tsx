import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { colors, radius, typography } from "@/lib/theme";
import type { PressableState } from "@/types";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function LoginScreen() {
  const {
    mode,
    switchMode,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    info,
    submitting,
    onSubmit,
    submitLabel,
  } = useLoginForm();

  return (
    <Screen title="Hatchery Check-In" showBack={false} gap={12}>
      <View style={styles.toggle}>
        <ModePill label="Sign in" active={mode === "signin"} onPress={() => switchMode("signin")} />
        <ModePill label="Sign up" active={mode === "signup"} onPress={() => switchMode("signup")} />
      </View>

      {mode === "signup" && (
        <>
          <TextField
            label="First name"
            id="given-name"
            placeholder="First name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            textContentType="givenName"
          />
          <TextField
            label="Last name"
            id="family-name"
            placeholder="Last name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            textContentType="familyName"
          />
        </>
      )}

      <TextField
        label="Email"
        id="email"
        placeholder="you@example.edu"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <TextField
        label="Password"
        id="password"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        textContentType="password"
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {info && <Text style={styles.info}>{info}</Text>}

      {submitting ? (
        <View style={styles.submitBusy}>
          <ActivityIndicator color={colors.surface} />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={onSubmit}
          style={({ pressed, hovered }: PressableState) => [
            styles.submit,
            (pressed || (Platform.OS === "web" && hovered)) && styles.submitActive,
          ]}>
          <Text style={styles.submitLabel}>{submitLabel}</Text>
        </Pressable>
      )}
    </Screen>
  );
}

function ModePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed, hovered }: PressableState) => [
        styles.pill,
        active && styles.pillActive,
        !active && (pressed || (Platform.OS === "web" && hovered)) && styles.pillHover,
      ]}>
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 4,
  },
  pill: {
    flex: 1,
    height: 44,
    borderRadius: radius - 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: colors.blue,
  },
  pillHover: {
    backgroundColor: "#f4f4f3",
  },
  pillLabel: {
    ...typography.button,
    color: colors.muted,
  },
  pillLabelActive: {
    color: colors.surface,
  },
  error: {
    ...typography.subtext,
    color: colors.error,
  },
  info: {
    ...typography.subtext,
    color: colors.blueBright,
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
