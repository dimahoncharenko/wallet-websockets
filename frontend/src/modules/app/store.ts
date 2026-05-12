import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppNotification, NotificationType } from 'types';

type AppState = {
  activeNav: string;
  notifications: AppNotification[];
};

function makeNotification(
  type: NotificationType,
  title: string,
  description: string,
): AppNotification {
  return {
    id: `${Date.now()}-${Math.random()}`,
    type,
    title,
    description,
    timestamp: new Date().toISOString(),
    interacted: false,
  };
}

const appSlice = createSlice({
  name: 'app',
  initialState: {
    activeNav: 'home',
    notifications: [],
  } as AppState,
  reducers: {
    setActiveNav(state, action: PayloadAction<string>) {
      state.activeNav = action.payload;
    },
    addNotification: {
      reducer(state, action: PayloadAction<AppNotification>) {
        state.notifications.unshift(action.payload);
      },
      prepare(type: NotificationType, title: string, description: string) {
        return { payload: makeNotification(type, title, description) };
      },
    },
    markAllRead(state) {
      for (const n of state.notifications) n.interacted = true;
    },
    dismissNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
  },
});

export const {
  setActiveNav,
  addNotification,
  markAllRead,
  dismissNotification,
} = appSlice.actions;

export default appSlice.reducer;
