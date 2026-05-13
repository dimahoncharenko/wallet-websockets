import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { AppInitializer } from '@modules/app/AppInitializer';
import { ModalProvider } from '@hooks/useModal';
import { WebsocketProvider } from '@hooks/useWebsocket';
import { NotificationsProvider } from '@hooks/useNotifications';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>
        <AppInitializer>
          <WebsocketProvider>
            <NotificationsProvider>
              <ModalProvider>{children}</ModalProvider>
            </NotificationsProvider>
          </WebsocketProvider>
        </AppInitializer>
      </PersistGate>
    </ReduxProvider>
  );
};
