import {
  colors,
  fontSize,
  fontWeight,
  letterSpacing,
  radius,
  layout,
  zIndex,
  transition,
  prefersReducedMotion,
} from '@lib/theme';
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
import { useNavigation } from '@hooks/useNavigation';

const mobileNavItems = [
  { id: 'home', label: 'Home', Icon: SvgHome },
  { id: 'cards', label: 'Cards', Icon: SvgCards },
  { id: 'history', label: 'History', Icon: SvgHistory },
  { id: 'profile', label: 'Profile', Icon: SvgProfile },
];

const anim = (delay: string, duration = '0.4s') =>
  prefersReducedMotion ? undefined : `fadeUp ${duration} ease ${delay} both`;

export const MobileComposition = () => {
  const { username } = useAuth();
  const { setModal, modals } = useModal();
  const { cardTheme, currentCard, income, spending } = useWalletCards();
  const { unreadCount } = useNotifications();
  const { activeNav, setActiveNav } = useNavigation();

  const renderCardAnalytics = () => {
    if (!currentCard) {
      return null;
    }

    return (
      <>
        <div
          style={{
            padding: '0 16px',
            marginBottom: 16,
            animation: anim('0.2s'),
          }}
        >
          <Stats income={income} spending={spending} />
        </div>
        <div
          style={{
            padding: '0 16px',
            marginBottom: 16,
            animation: anim('0.24s'),
          }}
        >
          <BudgetBar
            income={income.value}
            spending={spending.value}
            dot={cardTheme.dot}
          />
        </div>
      </>
    );
  };

  return (
    <div
      className="flex flex-col lg:hidden"
      style={{
        height: '100dvh',
        background: colors.bgAlt,
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
            animation: anim('0.05s'),
          }}
        >
          <div>
            <p
              style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.medium,
                color: colors.textSubtle,
                letterSpacing: letterSpacing.wider,
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              {getGreetings()}
            </p>
            <h1
              style={{
                fontSize: fontSize['4xl'],
                fontWeight: fontWeight.extrabold,
                color: colors.textPrimary,
                letterSpacing: letterSpacing.tighter,
              }}
            >
              {username || 'Hi there'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : 'Notifications'
              }
              aria-expanded={modals.notificationsPanel}
              aria-controls="notifications-panel"
              onClick={() =>
                setModal('notificationsPanel', !modals.notificationsPanel)
              }
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.xl,
                cursor: 'pointer',
                position: 'relative',
                background: colors.surfaceDefault,
                border: `1px solid ${colors.borderDefault}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SvgBell color={colors.textSecondary} />
              {unreadCount > 0 && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 9,
                    right: 9,
                    width: 7,
                    height: 7,
                    borderRadius: radius.full,
                    background: colors.notificationDot,
                    border: `1.5px solid ${colors.bgAlt}`,
                  }}
                />
              )}
            </button>
            <button
              aria-label="Scan QR code"
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.xl,
                background: colors.surfaceDefault,
                border: `1px solid ${colors.borderDefault}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <SvgScan color={colors.textSecondary} />
            </button>
          </div>
        </div>

        {currentCard ? (
          <>
            <div
              style={{
                padding: '0 22px',
                marginBottom: 16,
                animation: anim('0.1s', '0.5s'),
              }}
            >
              <WalletCard />
            </div>
            <div
              style={{
                padding: '0 22px',
                marginBottom: 24,
                animation: anim('0.16s'),
              }}
            >
              <CardControls card={currentCard} balance={currentCard.balance} />
            </div>

            {renderCardAnalytics()}

            <div
              style={{
                padding: '0 22px 16px',
                animation: anim('0.28s'),
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
      <nav
        aria-label="Main navigation"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: layout.bottomNavHeight,
          background: colors.bgNavBar,
          borderTop: `1px solid ${colors.borderSubtle}`,
          display: 'flex',
          alignItems: 'center',
          paddingBottom: 8,
          zIndex: zIndex.bottomNav,
        }}
      >
        {mobileNavItems.map(({ id, label, Icon }) => {
          const isActive = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              aria-current={isActive ? 'page' : undefined}
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
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radius.lg,
                  background: isActive ? `${cardTheme.dot}22` : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: `background ${transition.default}`,
                }}
              >
                <Icon
                  color={isActive ? cardTheme.dot : colors.textSubtle}
                  filled={isActive && id === 'home'}
                />
              </div>
              <span
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: isActive ? fontWeight.bold : fontWeight.regular,
                  color: isActive ? cardTheme.dot : colors.textSubtle,
                  transition: `color ${transition.default}`,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
