import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../../store';
import { AuthProvider } from '@hooks/useAuth';
import { ModalProvider } from '@hooks/useModal';
import { WebsocketProvider } from '@hooks/useWebsocket';
import { NotificationsProvider } from '@hooks/useNotifications';
import { WalletCardsProvider } from '@hooks/useWalletCards';
import { RootActionsProvider } from '@hooks/useRootActions';
import { NavigationProvider } from '@hooks/useNavigation';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <WebsocketProvider>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <WalletCardsProvider>
              <NotificationsProvider>
                <ModalProvider>
                  <RootActionsProvider>
                    <NavigationProvider>{children}</NavigationProvider>
                  </RootActionsProvider>
                </ModalProvider>
              </NotificationsProvider>
            </WalletCardsProvider>
          </PersistGate>
        </Provider>
      </WebsocketProvider>
    </AuthProvider>
  );
};
