import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  initialized: boolean;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: { session: null, initialized: false } as AuthState,
  reducers: {
    setSession(state, action: PayloadAction<Session | null>) {
      state.session = action.payload;
      state.initialized = true;
    },
  },
});

export const { setSession } = authSlice.actions;
export default authSlice.reducer;
