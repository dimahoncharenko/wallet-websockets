import {
  colors,
  fontSize,
  fontWeight,
  letterSpacing,
  radius,
  layout,
  zIndex,
  transition,
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
import { CardTheme } from '@modules/wallet/const';

const mobileNavItems = [
  { id: 'home', label: 'Home', Icon: SvgHome },
  { id: 'cards', label: 'Cards', Icon: SvgCards },
  { id: 'history', label: 'History', Icon: SvgHistory },
  { id: 'profile', label: 'Profile', Icon: SvgProfile },
];

export const MobileComposition = () => {
  const { cardTheme, currentCard, income, spending } = useWalletCards();
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
            animation: 'fadeUp 0.4s ease 0.2s both',
          }}
        >
          <Stats income={income} spending={spending} />
        </div>
        <div
          style={{
            padding: '0 16px',
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
        <Header />

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

            {renderCardAnalytics()}

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

      <BottomNav
        cardTheme={cardTheme}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />
    </div>
  );
};

const Header = () => {
  const { setModal, modals } = useModal();
  const { unreadCount } = useNotifications();
  const { username } = useAuth();

  return (
    <div
      style={{
        padding: '36px 24px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        animation: 'fadeUp 0.4s ease 0.05s both',
      }}
    >
      <div>
        <div
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
        </div>
        <div
          style={{
            fontSize: fontSize['4xl'],
            fontWeight: fontWeight.extrabold,
            color: colors.textPrimary,
            letterSpacing: letterSpacing.tighter,
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
  );
};

const BottomNav = ({
  cardTheme,
  activeNav,
  setActiveNav,
}: {
  cardTheme: CardTheme;
  activeNav: string;
  setActiveNav: (value: string) => void;
}) => {
  return (
    <div
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
    </div>
  );
};
