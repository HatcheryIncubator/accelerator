import { Redirect } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";

// The root AuthGate handles unauthenticated / no-venture redirects. For an authed
// user we route by role: admins to the dashboard, participants home.
export default function Index() {
  const { participant } = useAuth();
  return <Redirect href={participant?.role === "admin" ? "/admin" : "/home"} />;
}
