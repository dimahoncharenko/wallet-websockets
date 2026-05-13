import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setSession } from './store';
import type { Session } from '@supabase/supabase-js';

const makeStore = () => configureStore({ reducer: authReducer });

const makeSession = (overrides: Partial<Session> = {}): Session =>
  ({
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { username: 'testuser' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
    },
    ...overrides,
  }) as Session;

describe('auth slice', () => {
  describe('initial state', () => {
    it('starts with session null', () => {
      const store = makeStore();
      expect(store.getState().session).toBeNull();
    });

    it('starts with initialized false', () => {
      const store = makeStore();
      expect(store.getState().initialized).toBe(false);
    });
  });

  describe('setSession', () => {
    it('stores the session object', () => {
      const store = makeStore();
      const session = makeSession();
      store.dispatch(setSession(session));
      expect(store.getState().session).toEqual(session);
    });

    it('marks initialized as true after receiving a session', () => {
      const store = makeStore();
      store.dispatch(setSession(makeSession()));
      expect(store.getState().initialized).toBe(true);
    });

    it('marks initialized as true when called with null', () => {
      const store = makeStore();
      store.dispatch(setSession(null));
      expect(store.getState().initialized).toBe(true);
    });

    it('clears the session when called with null', () => {
      const store = makeStore();
      store.dispatch(setSession(makeSession()));
      store.dispatch(setSession(null));
      expect(store.getState().session).toBeNull();
    });

    it('overwrites a previous session with a new one', () => {
      const store = makeStore();
      store.dispatch(setSession(makeSession()));
      const newSession = makeSession({ access_token: 'new-token' });
      store.dispatch(setSession(newSession));
      expect(store.getState().session?.access_token).toBe('new-token');
    });

    it('preserves unrelated session fields', () => {
      const store = makeStore();
      const session = makeSession({ refresh_token: 'my-refresh' });
      store.dispatch(setSession(session));
      expect(store.getState().session?.refresh_token).toBe('my-refresh');
    });

    it('initialized remains true after a null-to-session transition', () => {
      const store = makeStore();
      store.dispatch(setSession(null));
      store.dispatch(setSession(makeSession()));
      expect(store.getState().initialized).toBe(true);
    });
  });
});
