import { configureStore } from '@reduxjs/toolkit';
import appReducer, {
  setActiveNav,
  addNotification,
  markAllRead,
  dismissNotification,
} from './store';
import type { AppNotification } from 'types';

const makeStore = () => configureStore({ reducer: appReducer });

const makeStoreWith = (notifications: AppNotification[]) =>
  configureStore({
    reducer: appReducer,
    preloadedState: { activeNav: 'home', notifications },
  });

const makeNotif = (
  overrides: Partial<AppNotification> = {},
): AppNotification => ({
  id: 'test-id',
  type: 'signin',
  title: 'Test notification',
  description: 'Test description',
  timestamp: '2024-06-15T10:00:00.000Z',
  interacted: false,
  ...overrides,
});

describe('app slice', () => {
  describe('initial state', () => {
    it('sets activeNav to "home"', () => {
      expect(makeStore().getState().activeNav).toBe('home');
    });

    it('sets notifications to an empty array', () => {
      expect(makeStore().getState().notifications).toEqual([]);
    });
  });

  describe('setActiveNav', () => {
    it('updates activeNav to the given value', () => {
      const store = makeStore();
      store.dispatch(setActiveNav('transactions'));
      expect(store.getState().activeNav).toBe('transactions');
    });

    it('overwrites the previous value on subsequent dispatches', () => {
      const store = makeStore();
      store.dispatch(setActiveNav('transactions'));
      store.dispatch(setActiveNav('home'));
      expect(store.getState().activeNav).toBe('home');
    });

    it('does not affect notifications', () => {
      const store = makeStore();
      store.dispatch(setActiveNav('transactions'));
      expect(store.getState().notifications).toEqual([]);
    });
  });

  describe('addNotification', () => {
    let randomUUIDSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T10:00:00.000Z'));
      randomUUIDSpy = vi
        .spyOn(crypto, 'randomUUID')
        .mockReturnValue('mocked-uuid' as ReturnType<typeof crypto.randomUUID>);
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('adds a notification to the state', () => {
      const store = makeStore();
      store.dispatch(
        addNotification(
          'signin',
          'Sign-in detected',
          'Your account was accessed',
        ),
      );
      expect(store.getState().notifications).toHaveLength(1);
    });

    it('sets the correct type', () => {
      const store = makeStore();
      store.dispatch(
        addNotification('money_received', 'Money received', 'You got $50'),
      );
      expect(store.getState().notifications[0].type).toBe('money_received');
    });

    it('sets the correct title', () => {
      const store = makeStore();
      store.dispatch(
        addNotification(
          'signin',
          'Sign-in detected',
          'Your account was accessed',
        ),
      );
      expect(store.getState().notifications[0].title).toBe('Sign-in detected');
    });

    it('sets the correct description', () => {
      const store = makeStore();
      store.dispatch(
        addNotification(
          'signin',
          'Sign-in detected',
          'Your account was accessed',
        ),
      );
      expect(store.getState().notifications[0].description).toBe(
        'Your account was accessed',
      );
    });

    it('sets interacted to false', () => {
      const store = makeStore();
      store.dispatch(
        addNotification(
          'signin',
          'Sign-in detected',
          'Your account was accessed',
        ),
      );
      expect(store.getState().notifications[0].interacted).toBe(false);
    });

    it('sets timestamp to the current ISO string', () => {
      const store = makeStore();
      store.dispatch(
        addNotification(
          'signin',
          'Sign-in detected',
          'Your account was accessed',
        ),
      );
      expect(store.getState().notifications[0].timestamp).toBe(
        '2024-06-15T10:00:00.000Z',
      );
    });

    it('uses the id from crypto.randomUUID()', () => {
      const store = makeStore();
      store.dispatch(
        addNotification(
          'signin',
          'Sign-in detected',
          'Your account was accessed',
        ),
      );
      expect(store.getState().notifications[0].id).toBe('mocked-uuid');
    });

    it('prepends to existing notifications (newest first)', () => {
      randomUUIDSpy
        .mockReturnValueOnce(
          'first-uuid' as ReturnType<typeof crypto.randomUUID>,
        )
        .mockReturnValueOnce(
          'second-uuid' as ReturnType<typeof crypto.randomUUID>,
        );

      const store = makeStore();
      store.dispatch(addNotification('signin', 'First', 'First description'));
      store.dispatch(
        addNotification('money_received', 'Second', 'Second description'),
      );

      const { notifications } = store.getState();
      expect(notifications[0].id).toBe('second-uuid');
      expect(notifications[1].id).toBe('first-uuid');
    });

    it('accumulates multiple notifications', () => {
      const store = makeStore();
      store.dispatch(addNotification('signin', 'First', 'First description'));
      store.dispatch(
        addNotification('money_received', 'Second', 'Second description'),
      );
      store.dispatch(
        addNotification('money_sent', 'Third', 'Third description'),
      );
      expect(store.getState().notifications).toHaveLength(3);
    });

    it('does not affect activeNav', () => {
      const store = makeStore();
      store.dispatch(
        addNotification(
          'signin',
          'Sign-in detected',
          'Your account was accessed',
        ),
      );
      expect(store.getState().activeNav).toBe('home');
    });
  });

  describe('markAllRead', () => {
    it('sets interacted to true for every notification', () => {
      const store = makeStoreWith([
        makeNotif({ id: '1', interacted: false }),
        makeNotif({ id: '2', interacted: false }),
        makeNotif({ id: '3', interacted: false }),
      ]);
      store.dispatch(markAllRead());
      for (const n of store.getState().notifications) {
        expect(n.interacted).toBe(true);
      }
    });

    it('is a no-op on an empty notifications array', () => {
      const store = makeStore();
      store.dispatch(markAllRead());
      expect(store.getState().notifications).toEqual([]);
    });

    it('leaves already-read notifications as true', () => {
      const store = makeStoreWith([makeNotif({ id: '1', interacted: true })]);
      store.dispatch(markAllRead());
      expect(store.getState().notifications[0].interacted).toBe(true);
    });

    it('marks both read and unread notifications when mixed', () => {
      const store = makeStoreWith([
        makeNotif({ id: '1', interacted: false }),
        makeNotif({ id: '2', interacted: true }),
        makeNotif({ id: '3', interacted: false }),
      ]);
      store.dispatch(markAllRead());
      for (const n of store.getState().notifications) {
        expect(n.interacted).toBe(true);
      }
    });

    it('preserves other notification fields', () => {
      const store = makeStoreWith([
        makeNotif({ id: '1', title: 'Original title', type: 'security' }),
      ]);
      store.dispatch(markAllRead());
      const n = store.getState().notifications[0];
      expect(n.id).toBe('1');
      expect(n.title).toBe('Original title');
      expect(n.type).toBe('security');
    });

    it('does not affect activeNav', () => {
      const store = makeStoreWith([makeNotif()]);
      store.dispatch(markAllRead());
      expect(store.getState().activeNav).toBe('home');
    });
  });

  describe('dismissNotification', () => {
    it('removes the notification with the matching id', () => {
      const store = makeStoreWith([makeNotif({ id: 'target' })]);
      store.dispatch(dismissNotification('target'));
      expect(store.getState().notifications).toHaveLength(0);
    });

    it('keeps notifications with a different id', () => {
      const store = makeStoreWith([
        makeNotif({ id: 'keep-1' }),
        makeNotif({ id: 'remove' }),
        makeNotif({ id: 'keep-2' }),
      ]);
      store.dispatch(dismissNotification('remove'));
      const ids = store.getState().notifications.map((n) => n.id);
      expect(ids).toEqual(['keep-1', 'keep-2']);
    });

    it('is a no-op when the id does not match any notification', () => {
      const store = makeStoreWith([makeNotif({ id: 'existing' })]);
      store.dispatch(dismissNotification('non-existent'));
      expect(store.getState().notifications).toHaveLength(1);
    });

    it('is a no-op on an empty notifications array', () => {
      const store = makeStore();
      store.dispatch(dismissNotification('any-id'));
      expect(store.getState().notifications).toEqual([]);
    });

    it('can dismiss all notifications one by one', () => {
      const store = makeStoreWith([
        makeNotif({ id: '1' }),
        makeNotif({ id: '2' }),
        makeNotif({ id: '3' }),
      ]);
      store.dispatch(dismissNotification('1'));
      store.dispatch(dismissNotification('2'));
      store.dispatch(dismissNotification('3'));
      expect(store.getState().notifications).toHaveLength(0);
    });

    it('preserves the order of remaining notifications', () => {
      const store = makeStoreWith([
        makeNotif({ id: '1' }),
        makeNotif({ id: '2' }),
        makeNotif({ id: '3' }),
      ]);
      store.dispatch(dismissNotification('2'));
      const ids = store.getState().notifications.map((n) => n.id);
      expect(ids).toEqual(['1', '3']);
    });

    it('does not affect activeNav', () => {
      const store = makeStoreWith([makeNotif({ id: 'target' })]);
      store.dispatch(dismissNotification('target'));
      expect(store.getState().activeNav).toBe('home');
    });
  });
});
