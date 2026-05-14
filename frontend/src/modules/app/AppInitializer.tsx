import { useEffect, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSession } from '@lib/supabase';
import { setSession } from '@modules/auth/store';
import type { RootState, AppDispatch } from '../main/store';

export const AppInitializer = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const initialized = useSelector((state: RootState) => state.auth.initialized);

  useEffect(() => {
    const subscription = getSession((session) => dispatch(setSession(session)));
    return () => subscription.unsubscribe();
  }, [dispatch]);

  if (!initialized) return null;
  return children;
};
