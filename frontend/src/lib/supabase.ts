import { createClient, Session } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

export const getSession = (setter: (session: Session | null) => void) => {
  supabase.auth.getSession().then(({ data }) => setter(data.session));

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_, s) => setter(s));

  return subscription;
};
