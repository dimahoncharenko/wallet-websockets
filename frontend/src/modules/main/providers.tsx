import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../../store';
import { AuthProvider } from '@hooks/useAuth';
import { ModalProvider } from '@hooks/useModal';
import { WebsocketProvider } from '@hooks/useWebsocket';
import { NotificationsProvider } from '@hooks/useNotifications';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <WebsocketProvider>
            <NotificationsProvider>
              <ModalProvider>{children}</ModalProvider>
            </NotificationsProvider>
          </WebsocketProvider>
        </PersistGate>
      </Provider>
    </AuthProvider>
  );
};
