import { Toaster } from 'react-hot-toast';
import { NotificationsPanel } from '@modules/notifications';
import { colors } from '@lib/theme';
import { MobileComposition } from './components/MobileComposition';
import { useInitCard } from './hooks/useInitCards';
import { DesktopComposition } from './components/DesktopComposition';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { useModal } from '@hooks/useModal';
import { AddCardModal } from '@modules/wallet/components/AddCardModal';

export const App = () => {
  useInitCard();
  const isDesktop = useMediaQuery();
  const { modals, setModal } = useModal();

  return (
    <>
      {isDesktop ? <DesktopComposition /> : <MobileComposition />}
      <NotificationsPanel />
      <AddCardModal
        isOpen={modals.addCardModal}
        onClose={() => setModal('addCardModal', false)}
      />
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
};

export default App;
