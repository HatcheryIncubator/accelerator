import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { supabase } from '@/lib/supabase';
import type { Participant, Venture } from '@/lib/types';

type SignUpResult = { needsConfirmation: boolean };

type AuthContextValue = {
  session: Session | null;
  participant: Participant | null;
  /** The ventures this participant works on (resolved from participants.venture_ids). */
  participantVentures: Venture[];
  /** True during initial session hydration only. */
  loading: boolean;
  /** True while the participants row + ventures are being fetched. */
  participantLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  refreshParticipant: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [participantVentures, setParticipantVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantLoading, setParticipantLoading] = useState(false);

  // Dedupes the getSession() / onAuthStateChange(INITIAL_SESSION) double-fire so
  // we fetch the participant row at most once per uid.
  const fetchedUidRef = useRef<string | null>(null);

  const fetchParticipant = useCallback(async (uid: string) => {
    setParticipantLoading(true);
    // Retry briefly: the handle_new_user() trigger may not have inserted the
    // row in the instant right after signUp (250ms, 500ms, 1s backoff).
    let row: Participant | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', uid)
        .maybeSingle<Participant>();
      if (error) break; // transient — treat as no participant; caller can refresh
      if (data) {
        row = data;
        break;
      }
      await new Promise((r) => setTimeout(r, 250 * 2 ** attempt));
    }
    setParticipant(row);

    const ids = row?.venture_ids ?? [];
    if (ids.length > 0) {
      const { data: vs } = await supabase.from('ventures').select('id, name').in('id', ids);
      setParticipantVentures((vs ?? []).map((v) => ({ id: String(v.id), name: v.name })));
    } else {
      setParticipantVentures([]);
    }
    setParticipantLoading(false);
  }, []);

  const syncForSession = useCallback(
    async (next: Session | null) => {
      setSession(next);
      const uid = next?.user.id ?? null;
      if (!uid) {
        fetchedUidRef.current = null;
        setParticipant(null);
        setParticipantVentures([]);
        setParticipantLoading(false);
        return;
      }
      if (fetchedUidRef.current === uid) return; // already fetched/fetching
      fetchedUidRef.current = uid;
      await fetchParticipant(uid);
    },
    [fetchParticipant],
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      void syncForSession(data.session).finally(() => {
        if (active) setLoading(false);
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      void syncForSession(next);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [syncForSession]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // onAuthStateChange drives session + participant fetch; the root gate navigates.
  }, []);

  const signUpWithPassword = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // Passed to the handle_new_user() trigger to populate the participants row.
        options: { data: { first_name: firstName, last_name: lastName } },
      });
      if (error) throw error;
      // Email confirmation ON => session is null; caller shows "check your email".
      return { needsConfirmation: data.session === null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    fetchedUidRef.current = null;
    setParticipant(null);
    setParticipantVentures([]);
  }, []);

  const refreshParticipant = useCallback(async () => {
    const uid = session?.user.id;
    if (!uid) return;
    fetchedUidRef.current = uid;
    await fetchParticipant(uid);
  }, [session, fetchParticipant]);

  return (
    <AuthContext.Provider
      value={{
        session,
        participant,
        participantVentures,
        loading,
        participantLoading,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        refreshParticipant,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
