import "@/global.css";

import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
  useFonts,
} from "@expo-google-fonts/open-sans";
import { Redirect, Stack, useSegments } from "expo-router";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  // On native, hold render until fonts are ready to avoid a font swap flash.
  // On web (primary target) render immediately so the static export contains
  // real content (no blank pre-render); Open Sans swaps in when it loads.
  if (!fontsLoaded && Platform.OS !== "web") return null;

  return (
    <AuthProvider>
      {/* Stack is always mounted so the Router context exists for the gate. */}
      <Stack screenOptions={{ headerShown: false }} />
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { session, participant, participantVentures, loading, participantLoading } = useAuth();
  const segments = useSegments();
  const inAuthGroup = segments[0] === "(auth)";

  // 1) Initial session hydration.
  if (loading) return <SpinnerOverlay />;

  // 2) Signed out -> must be in the (auth) group.
  if (!session) {
    return inAuthGroup ? null : <Redirect href="/login" />;
  }

  // 3) Session exists but the participant row is still resolving — hold so we
  //    never bounce to select-venture prematurely.
  if (participantLoading) return <SpinnerOverlay />;

  // 4) Signed in, participant known, but not in any venture yet.
  //    Admins are exempt — they don't need a venture.
  const needsVenture =
    participant && participant.role !== "admin" && participantVentures.length === 0;
  if (needsVenture) {
    const onSelectVenture = segments[segments.length - 1] === "select-venture";
    return onSelectVenture ? null : <Redirect href="/select-venture" />;
  }

  // 5) Fully authed (admin, or a participant with a venture). If parked in
  //    (auth), go home.
  if (participant && !needsVenture && inAuthGroup) {
    return <Redirect href="/home" />;
  }

  return null;
}

function SpinnerOverlay() {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={colors.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bodyBg,
    alignItems: "center",
    justifyContent: "center",
  },
});
