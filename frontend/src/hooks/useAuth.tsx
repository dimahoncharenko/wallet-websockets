import { useSelector } from 'react-redux';
import { supabase } from '@lib/supabase';
import type { RootState } from '../modules/main/store';

export const useAuth = () => {
  const session = useSelector((state: RootState) => state.auth.session);

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
