import { ReactNode } from 'react';
import { CardColorProvider } from '@hooks/useCardColor';
import { ModalProvider } from '@hooks/useModal';
import { WebsocketProvider } from '@hooks/useWebsocket';
import { AuthProvider } from '@hooks/useAuth';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <WebsocketProvider>
        <ModalProvider>
          <CardColorProvider>{children}</CardColorProvider>
        </ModalProvider>
      </WebsocketProvider>
    </AuthProvider>
  );
};
