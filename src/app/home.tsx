import { AdminHome } from '@/components/AdminHome';
import { ParticipantHome } from '@/components/ParticipantHome';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { participant } = useAuth();
  return participant?.role === 'admin' ? <AdminHome /> : <ParticipantHome />;
}
