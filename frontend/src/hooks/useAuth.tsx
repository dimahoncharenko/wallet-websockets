import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Session } from '@supabase/supabase-js';
import { getSession, supabase } from '@lib/supabase';

type AuthContextValue = {
  session: Session | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const subscription = getSession(setSession);
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;

  return (
    <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');

  const { session } = ctx;
  return {
    isAuthenticated: !!session,
    username:
      session?.user.user_metadata?.username ?? session?.user.email ?? null,
    session,
    login: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    signup: (email: string, password: string, username: string) =>
      supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      }),
    logout: () => supabase.auth.signOut(),
  };
};
