import { Toaster } from 'react-hot-toast';
import { NotificationsPanel } from '@modules/notifications';
import { colors } from '@lib/theme';
import { MobileComposition } from './components/MobileComposition';
import { useInitCard } from './hooks/useInitCards';
import { DesktopComposition } from './components/DesktopComposition';
import { useMediaQuery } from '@hooks/useMediaQuery';

export const App = () => {
  useInitCard();
  const isDesktop = useMediaQuery();

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
};

export default App;
