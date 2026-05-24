import "@/global.css";

import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
  useFonts,
} from "@expo-google-fonts/open-sans";
import { Stack } from "expo-router";
import { Platform } from "react-native";

import { UserProvider } from "@/contexts/UserContext";

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
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  );
}
