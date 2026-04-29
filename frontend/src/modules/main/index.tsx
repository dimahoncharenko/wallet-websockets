import { Toaster } from 'react-hot-toast';
import WalletCard from '@modules/wallet';
import { CardPlaceholder } from '@modules/wallet/components/CardPlaceholder';
import { CardControls } from '@modules/wallet/components/CardControls';
import { Stats } from './components/Stats';
import { useAuth } from '@hooks/useAuth';
import { useNotifications } from '@hooks/useNotifications';
import { useModal } from '@hooks/useModal';
import Transactions from '@modules/transactions';
import { NotificationsPanel } from '@modules/notifications';
import { SvgBell, SvgSearch } from '@components/Icons';
import { BudgetBar } from './components/BudgetBar';
import { Sidebar } from './components/Sidebar';
import { MobileComposition } from './components/MobileComposition';
import { useWebsocket } from '@hooks/useWebsocket';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { getGreetings } from './helpers';
import { useWalletCards } from '@hooks/useWalletCards';
import { StatData } from 'types';
import { useInitCard } from './hooks/useInitCards';
import { RootActions, useRootActions } from '@hooks/useRootActions';

export function App() {
  const { updateBalance, sendAddCard } = useInitCard();
  const { setRootActions } = useRootActions();
  const { username } = useAuth();
  const { socket, connect, disconnect } = useWebsocket();
  const { setModal, modals } = useModal();
  const { unreadCount } = useNotifications();
  const { cards, currentCard, activeCardIndex, setActiveCardIndex, cardTheme } =
    useWalletCards();
  const [activeNav, setActiveNav] = useState('home');
  const [income, setIncome] = useState<StatData>({ value: 0, sparkline: [0] });
  const [spending, setSpending] = useState<StatData>({
    value: 0,
    sparkline: [0],
  });

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (
        event === 'TOKEN_REFRESHED' &&
        newSession &&
        socket?.readyState === WebSocket.OPEN
      ) {
        socket.send(
          JSON.stringify({
            event: 'token_refresh',
            token: newSession.access_token,
          }),
        );
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!socket || !currentCard) return;
    const handler = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.event === 'update-stats' && msg.pan === currentCard.pan) {
          setIncome(msg.income);
          setSpending(msg.spending);
        }
      } catch {
        /* ignore */
      }
    };
    socket.addEventListener('message', handler);
    return () => socket.removeEventListener('message', handler);
  }, [socket, currentCard?.pan]);

  const rootActions: RootActions = {
    sendAddCard,
    setSpending,
    setIncome,
    setActiveNav,
    updateBalance,
  };

  useEffect(() => {
    setRootActions(rootActions);
  }, []);

  return (
    <>
      {/* ── DESKTOP ───────────────────────────────────────────── */}
      <div
        className="hidden lg:flex h-screen overflow-hidden"
        style={{ background: '#08080f' }}
      >
        <Sidebar activeNav={activeNav} />

        {/* Main area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Topbar */}
          <div
            style={{
              height: 64,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              padding: '0 32px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  marginBottom: 2,
                }}
              >
                {getGreetings()}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                }}
              >
                {username ? `${username}'s Overview` : 'Overview'}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
                padding: '8px 14px',
                width: 200,
              }}
            >
              <SvgSearch color="rgba(255,255,255,0.25)" />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
                Search transactions…
              </span>
            </div>
            <button
              onClick={() =>
                setModal('notificationsPanel', !modals.notificationsPanel)
              }
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                cursor: 'pointer',
                position: 'relative',
                background: modals.notificationsPanel
                  ? `${cardTheme.dot}18`
                  : 'rgba(255,255,255,0.06)',
                border: `1px solid ${modals.notificationsPanel ? `${cardTheme.dot}44` : 'rgba(255,255,255,0.08)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s, border 0.2s',
              }}
            >
              <SvgBell
                color={
                  modals.notificationsPanel
                    ? cardTheme.dot
                    : 'rgba(255,255,255,0.6)'
                }
              />
              {unreadCount > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#ff6b8a',
                    border: '1.5px solid #08080f',
                  }}
                />
              )}
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <div
              style={{
                maxWidth: 960,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '55%',
                  height: '100%',
                  background: `radial-gradient(ellipse 70% 55% at 35% 25%, ${cardTheme.dot}88 0%, ${cardTheme.dot}22 55%, transparent 78%)`,
                  pointerEvents: 'none',
                  transition: 'background 0.8s',
                  animation: 'glowPulse 5s ease-in-out infinite',
                }}
              />

              {currentCard ? (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 20,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                      }}
                    >
                      <WalletCard
                        cards={cards}
                        activeIndex={activeCardIndex}
                        onActiveIndexChange={setActiveCardIndex}
                        onAddCard={sendAddCard}
                      />
                      <CardControls
                        card={currentCard}
                        balance={currentCard.balance}
                      />
                    </div>
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 22,
                        padding: '20px 22px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Transactions currentCard={currentCard} />
                    </div>
                  </div>
                  <Stats
                    currentCard={currentCard}
                    onStatsUpdate={(inc, spd) => {
                      setIncome(inc);
                      setSpending(spd);
                    }}
                  />
                  <BudgetBar
                    income={income.value}
                    spending={spending.value}
                    dot={cardTheme.dot}
                  />
                </>
              ) : (
                <div className="w-full max-w-sm mx-auto">
                  <CardPlaceholder />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE ────────────────────────────────────────────── */}
      <MobileComposition
        activeNav={activeNav}
        income={income}
        spending={spending}
      />

      <NotificationsPanel />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            fontFamily: 'Sora, sans-serif',
          },
        }}
      />
    </>
  );
}

export default App;
