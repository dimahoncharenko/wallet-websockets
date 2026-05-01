import {
  colors,
  fontSize,
  fontWeight,
  letterSpacing,
  radius,
  layout,
  transition,
} from '@lib/theme';
import { useRootActions } from '@hooks/useRootActions';
import { Sidebar } from './Sidebar';
import { getGreetings } from '../helpers';
import { useAuth } from '@hooks/useAuth';
import { SvgBell, SvgSearch } from '@components/Icons';
import Wallet from '@modules/wallet';
import { CardControls } from '@modules/wallet/components/CardControls';
import Transactions from '@modules/transactions';
import { Stats } from './Stats';
import { BudgetBar } from './BudgetBar';
import { CardPlaceholder } from '@modules/wallet/components/CardPlaceholder';
import { useModal } from '@hooks/useModal';
import { useWalletCards } from '@hooks/useWalletCards';
import { useNotifications } from '@hooks/useNotifications';

export const DesktopComposition = () => {
  const { sendAddCard } = useRootActions();
  const {
    cards,
    cardTheme,
    activeCardIndex,
    setActiveCardIndex,
    currentCard,
    income,
    spending,
  } = useWalletCards();

  const renderCardAnalytics = () => {
    if (!currentCard) {
      return null;
    }

    return (
      <>
        <Stats income={income} spending={spending} />
        <BudgetBar
          income={income.value}
          spending={spending.value}
          dot={cardTheme.dot}
        />
      </>
    );
  };

  return (
    <div
      className="hidden lg:flex h-screen overflow-hidden"
      style={{ background: colors.bg }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <TopBar />

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
                transition: `background ${transition.slow}`,
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
                    <Wallet
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
                      background: colors.surfaceBare,
                      border: `1px solid ${colors.borderSubtle}`,
                      borderRadius: radius['3xl'],
                      padding: '20px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Transactions currentCard={currentCard} />
                  </div>
                </div>
                {renderCardAnalytics()}
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
  );
};

const TopBar = () => {
  const { username } = useAuth();
  const { modals, setModal } = useModal();
  const { unreadCount } = useNotifications();
  const { cardTheme } = useWalletCards();

  return (
    <div
      style={{
        height: layout.topbarHeight,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        borderBottom: `1px solid ${colors.borderFaint}`,
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: fontSize.sm,
            color: colors.textPlaceholder,
            letterSpacing: letterSpacing.wide,
            textTransform: 'uppercase',
            fontWeight: fontWeight.medium,
            marginBottom: 2,
          }}
        >
          {getGreetings()}
        </div>
        <div
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: fontWeight.extrabold,
            color: colors.textPrimary,
            letterSpacing: letterSpacing.tight,
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
          background: colors.surfaceSubtle,
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: radius.md,
          padding: '8px 14px',
          width: 200,
        }}
      >
        <SvgSearch color={colors.textPlaceholder} />
        <span style={{ fontSize: fontSize.md, color: colors.textFaint }}>
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
          borderRadius: radius.lg,
          cursor: 'pointer',
          position: 'relative',
          background: modals.notificationsPanel
            ? `${cardTheme.dot}18`
            : colors.surfaceDefault,
          border: `1px solid ${modals.notificationsPanel ? `${cardTheme.dot}44` : colors.borderDefault}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `background ${transition.default}, border ${transition.default}`,
        }}
      >
        <SvgBell
          color={
            modals.notificationsPanel ? cardTheme.dot : colors.textSecondary
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
              borderRadius: radius.full,
              background: colors.notificationDot,
              border: `1.5px solid ${colors.bg}`,
            }}
          />
        )}
      </button>
    </div>
  );
};
