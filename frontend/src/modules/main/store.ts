import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import walletReducer from '../wallet/store';
import authReducer from '../auth/store';
import appReducer from '../app/store';

const walletPersistConfig = { key: 'wallet', storage, whitelist: ['colors'] };

const rootReducer = combineReducers({
  wallet: persistReducer(walletPersistConfig, walletReducer),
  auth: authReducer,
  app: appReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  blacklist: ['auth', 'app', 'wallet'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
