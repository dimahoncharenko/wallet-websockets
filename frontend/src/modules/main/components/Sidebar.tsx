import {
  colors,
  fontSize,
  fontWeight,
  letterSpacing,
  radius,
  layout,
  transition,
} from '@lib/theme';
import {
  SvgCards,
  SvgHistory,
  SvgHome,
  SvgLogout,
  SvgProfile,
  SvgSettings,
} from '@components/Icons';
import { useAuth } from '@hooks/useAuth';
import { useNavigation } from '@hooks/useNavigation';
import { useWalletCards } from '@hooks/useWalletCards';
import { CardTheme } from '@modules/wallet/const';

const navItems = [
  { id: 'home', label: 'Overview', Icon: SvgHome },
  { id: 'cards', label: 'Cards', Icon: SvgCards },
  { id: 'history', label: 'History', Icon: SvgHistory },
  { id: 'profile', label: 'Profile', Icon: SvgProfile },
  { id: 'settings', label: 'Settings', Icon: SvgSettings },
];

export const Sidebar = () => {
  const { username, logout } = useAuth();
  const { cardTheme } = useWalletCards();
  const { activeNav, setActiveNav } = useNavigation();

  return (
    <div
      style={{
        width: layout.sidebarWidth,
        flexShrink: 0,
        background: colors.bgSidebar,
        borderRight: `1px solid ${colors.surfaceDefault}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 0',
      }}
    >
      <div
        style={{
          padding: '0 24px 36px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: radius.md,
            background: `linear-gradient(135deg, ${cardTheme.a}, ${cardTheme.b})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: fontSize.lg,
            transition: `background ${transition.slow}`,
          }}
        >
          ◈
        </div>
        <span
          style={{
            fontSize: fontSize.xl,
            fontWeight: fontWeight.extrabold,
            color: colors.textPrimary,
            letterSpacing: letterSpacing.tight,
          }}
        >
          Wallet
        </span>
      </div>

      <div
        style={{
          flex: 1,
          padding: '0 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <NavItems
          items={navItems}
          setActiveNav={setActiveNav}
          activeNav={activeNav}
          cardTheme={cardTheme}
        />
      </div>

      <div
        style={{
          padding: '20px 24px 0',
          borderTop: `1px solid ${colors.surfaceDefault}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            role="img"
            aria-label="profile-icon"
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.lg,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${cardTheme.a}88, ${cardTheme.b}88)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: fontSize.xl,
              transition: `background ${transition.slow}`,
            }}
          >
            🧑
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: fontSize.md,
                fontWeight: fontWeight.bold,
                color: colors.textPrimary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {username || 'User'}
            </div>
            <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
              Personal
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              borderRadius: radius.sm,
            }}
            title="Logout"
          >
            <SvgLogout color={colors.textMuted} />
          </button>
        </div>
      </div>
    </div>
  );
};

const NavItems = ({
  items,
  activeNav,
  setActiveNav,
  cardTheme,
}: {
  items: typeof navItems;
  activeNav: string;
  setActiveNav: (param: string) => void;
  cardTheme: CardTheme;
}) => {
  return items.map(({ id, label, Icon }) => {
    const isActive = activeNav === id;
    return (
      <button
        key={id}
        onClick={() => setActiveNav(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          borderRadius: radius.lg,
          cursor: 'pointer',
          background: isActive ? `${cardTheme.dot}14` : 'transparent',
          border: 'none',
          width: '100%',
          transition: `background ${transition.fast}`,
        }}
      >
        <Icon
          color={isActive ? cardTheme.dot : colors.textMuted}
          filled={isActive && id === 'home'}
        />
        <span
          style={{
            fontSize: fontSize.base,
            fontWeight: isActive ? fontWeight.bold : fontWeight.medium,
            color: isActive ? cardTheme.dot : colors.textTertiary,
            transition: `color ${transition.fast}`,
          }}
        >
          {label}
        </span>
        {isActive && (
          <div
            style={{
              marginLeft: 'auto',
              width: 4,
              height: 16,
              borderRadius: 2,
              background: cardTheme.dot,
            }}
          />
        )}
      </button>
    );
  });
};
