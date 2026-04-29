import {
  SvgBell,
  SvgCards,
  SvgHistory,
  SvgHome,
  SvgProfile,
  SvgScan,
} from '@components/Icons';
import { useModal } from '@hooks/useModal';
import { WalletCard } from '@modules/wallet/components/WalletCard';
import { Stats } from './Stats';
import { CardControls } from '@modules/wallet/components/CardControls';
import { BudgetBar } from './BudgetBar';
import Transactions from '@modules/transactions';
import { CardPlaceholder } from '@modules/wallet/components/CardPlaceholder';
import { useAuth } from '@hooks/useAuth';
import { useNotifications } from '@hooks/useNotifications';
import { useWalletCards } from '@hooks/useWalletCards';
import { getGreetings } from '../helpers';
import { useRootActions } from '@hooks/useRootActions';
import { StatData } from 'types';

const mobileNavItems = [
  { id: 'home', label: 'Home', Icon: SvgHome },
  { id: 'cards', label: 'Cards', Icon: SvgCards },
  { id: 'history', label: 'History', Icon: SvgHistory },
  { id: 'profile', label: 'Profile', Icon: SvgProfile },
];

type Props = {
  income: StatData;
  spending: StatData;
  activeNav: string;
};

export const MobileComposition = ({ income, spending, activeNav }: Props) => {
  const { username } = useAuth();
  const { setModal, modals } = useModal();
  const { cardTheme, currentCard } = useWalletCards();
  const { unreadCount } = useNotifications();
  const { setIncome, setSpending, setActiveNav } = useRootActions();

  return (
    <div
      className="flex flex-col lg:hidden"
      style={{
        height: '100dvh',
        background: '#0d0d18',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: 80,
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '62px 22px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            animation: 'fadeUp 0.4s ease 0.05s both',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.28)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              {getGreetings()}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.03em',
              }}
            >
              {username || 'Hi there'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              onClick={() =>
                setModal('notificationsPanel', !modals.notificationsPanel)
              }
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                cursor: 'pointer',
                position: 'relative',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SvgBell color="rgba(255,255,255,0.6)" />
              {unreadCount > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 9,
                    right: 9,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#ff6b8a',
                    border: '1.5px solid #0d0d18',
                  }}
                />
              )}
            </button>
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <SvgScan color="rgba(255,255,255,0.6)" />
            </button>
          </div>
        </div>

        {currentCard ? (
          <>
            <div
              style={{
                padding: '0 22px',
                marginBottom: 16,
                animation: 'fadeUp 0.5s ease 0.1s both',
              }}
            >
              <WalletCard />
            </div>
            <div
              style={{
                padding: '0 22px',
                marginBottom: 24,
                animation: 'fadeUp 0.4s ease 0.16s both',
              }}
            >
              <CardControls card={currentCard} balance={currentCard.balance} />
            </div>
            <div
              style={{
                padding: '0 16px',
                marginBottom: 16,
                animation: 'fadeUp 0.4s ease 0.2s both',
              }}
            >
              <Stats
                currentCard={currentCard}
                onStatsUpdate={(inc, spd) => {
                  setIncome?.(inc);
                  setSpending?.(spd);
                }}
              />
            </div>
            <div
              style={{
                padding: '0 22px',
                marginBottom: 16,
                animation: 'fadeUp 0.4s ease 0.24s both',
              }}
            >
              <BudgetBar
                income={income.value}
                spending={spending.value}
                dot={cardTheme.dot}
              />
            </div>
            <div
              style={{
                padding: '0 22px 16px',
                animation: 'fadeUp 0.4s ease 0.28s both',
              }}
            >
              <Transactions currentCard={currentCard} />
            </div>
          </>
        ) : (
          <div style={{ padding: '0 22px' }}>
            <CardPlaceholder />
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 72,
          background: 'rgba(13,13,24,0.97)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          paddingBottom: 8,
          zIndex: 100,
        }}
      >
        {mobileNavItems.map(({ id, label, Icon }) => {
          const isActive = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => setActiveNav?.(id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                padding: '8px 0',
                background: 'none',
                border: 'none',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: isActive ? `${cardTheme.dot}22` : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >
                <Icon
                  color={isActive ? cardTheme.dot : 'rgba(255,255,255,0.28)'}
                  filled={isActive && id === 'home'}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? cardTheme.dot : 'rgba(255,255,255,0.28)',
                  transition: 'color 0.2s',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
