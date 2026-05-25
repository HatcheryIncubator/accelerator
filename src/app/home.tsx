import { Redirect } from 'expo-router';

import { ParticipantHome } from '@/components/ParticipantHome';
import { useAuth } from '@/contexts/AuthContext';

// /home is the participant screen. Admins have their own dashboard at /admin —
// bounce any admin who lands here (deep link, stale tab) over to it.
export default function HomeScreen() {
  const { participant } = useAuth();
  if (participant?.role === 'admin') return <Redirect href="/admin" />;
  return <ParticipantHome />;
}
