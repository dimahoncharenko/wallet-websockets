import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import WalletCard from '@modules/wallet';
import { useInitCard } from './hooks/useInitCard';
import { CardPlaceholder } from '@modules/wallet/components/CardPlaceholder';
import { CardControls } from '@modules/wallet/components/CardControls';
import { Stats } from './components/Stats';
import { useWebsocket } from '@hooks/useWebsocket';
import Transactions from '@modules/transactions';
import { Header } from './components/Header';
import { NotificationsPanel } from '@modules/notifications';

export function App() {
  const { card, balance, setBalance } = useInitCard();
  const { connect, disconnect } = useWebsocket();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  const cards = card
    ? [
        { ...card, balance },
        {
          ...card,
          balance: 12500.5,
          pan: '5544 3322 1100 9988',
          cardColor: 'emerald' as const,
          cardNetwork: 'mastercard' as const,
          expiry: '12/28',
        },
        {
          ...card,
          balance: 420.0,
          pan: '4111 2222 3333 4444',
          cardColor: 'rose' as const,
          cardNetwork: 'visa' as const,
          expiry: '09/27',
        },
      ]
    : null;

  const currentCard = cards ? cards[activeIndex] : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10 lg:px-10 lg:py-8">
      <div className="flex flex-col items-center gap-8 lg:max-w-6xl lg:mx-auto lg:items-stretch">
        <Header />
        <NotificationsPanel />

        {cards && currentCard ? (
          <>
            <div className="w-full flex flex-col items-center gap-8 lg:grid lg:grid-cols-[440px,1fr] lg:items-stretch lg:gap-6">
              <div className="w-full max-w-sm lg:max-w-none flex flex-col gap-4">
                <WalletCard
                  cards={cards}
                  activeIndex={activeIndex}
                  onActiveIndexChange={setActiveIndex}
                />
                <CardControls
                  card={currentCard}
                  balance={currentCard.balance}
                  setBalance={setBalance}
                />
              </div>

              <div className="hidden lg:flex flex-col bg-white/[0.03] lg:mt-10 lg:mb-4 border border-white/[0.06] rounded-3xl overflow-hidden">
                <Transactions currentCard={currentCard} />
              </div>
            </div>

            <div className="w-full max-w-sm lg:max-w-none">
              <Stats currentCard={currentCard} />
            </div>

            <div className="w-full max-w-sm lg:hidden">
              <Transactions currentCard={currentCard} />
            </div>
          </>
        ) : (
          <div className="w-full max-w-sm">
            <CardPlaceholder />
          </div>
        )}
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#1e293b', color: '#fff' },
        }}
      />
    </main>
  );
}

export default App;
