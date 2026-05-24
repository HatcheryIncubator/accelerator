import { Redirect } from "expo-router";

// The root AuthGate handles unauthenticated / no-venture redirects; an authed
// user with a venture lands on /home from here.
export default function Index() {
  return <Redirect href="/home" />;
}
