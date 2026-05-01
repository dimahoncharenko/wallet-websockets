import { Toaster } from 'react-hot-toast';
import { NotificationsPanel } from '@modules/notifications';
import { colors } from '@lib/theme';
import { MobileComposition } from './components/MobileComposition';
import { useEffect } from 'react';
import { useInitCard } from './hooks/useInitCards';
import { RootActions, useRootActions } from '@hooks/useRootActions';
import { DesktopComposition } from './components/DesktopComposition';
import { useMediaQuery } from '@hooks/useMediaQuery';

export function App() {
  const { updateBalance, sendAddCard } = useInitCard();
  const { setRootActions } = useRootActions();
  const isDesktop = useMediaQuery();

  const rootActions: RootActions = {
    sendAddCard,
    updateBalance,
  };

  useEffect(() => {
    setRootActions(rootActions);
  }, []);

  return (
    <>
      {isDesktop ? <DesktopComposition /> : <MobileComposition />}

      <NotificationsPanel />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: colors.bgToast,
            color: colors.textPrimary,
            fontFamily: 'Sora, sans-serif',
          },
        }}
      />
    </>
  );
}

export default App;
