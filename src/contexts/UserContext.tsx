import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Holds the "current user" so screens can share it without prop drilling.
 * UI-only: seeded from mock data.
 * TODO: wire to Supabase / AuthContext — replace the seed with the signed-in user.
 */

export type CurrentUser = {
  firstName: string;
  lastName: string;
  email: string;
  ventureName: string;
};

const DEFAULT_USER: CurrentUser = {
  firstName: 'Jordan',
  lastName: 'Reeves',
  email: 'jreeves@example.edu',
  ventureName: 'Acme Co',
};

type UserContextValue = {
  user: CurrentUser;
  setUser: (user: CurrentUser) => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(DEFAULT_USER);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
