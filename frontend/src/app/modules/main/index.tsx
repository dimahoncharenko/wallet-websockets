import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import WalletCard from '@modules/wallet';
import { useInitCard } from './hooks/useInitCard';
import { CardPlaceholder } from '@modules/wallet/components/CardPlaceholder';
import { CardControls } from '@modules/wallet/components/CardControls';
import { Stats } from './components/Stats';
import { useWebsocket } from '@hooks/useWebsocket';
import { Sparkles } from '@modules/wallet/components/Sparkles';
import { CardLevitate } from '@modules/wallet/components/CardLevitate';
import Transactions from '@modules/transactions';
import { Header } from './components/Header';

export function App() {
  const { card, balance, setBalance } = useInitCard();
  const { connect, disconnect } = useWebsocket();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center px-4 py-10 gap-8">
      <Header card={card} />
      <div className="w-full max-w-sm">
        {card ? (
          <div className="flex flex-col gap-4">
            <div className="relative py-4">
              <CardLevitate>
                <Sparkles count={14} />
                <WalletCard card={{ ...card, balance }} />
              </CardLevitate>
              <div className="card-glow" />
            </div>
            <CardControls
              card={card}
              balance={balance}
              setBalance={setBalance}
            />
          </div>
        ) : (
          <CardPlaceholder />
        )}
      </div>
      <Stats />
      <Transactions />
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
