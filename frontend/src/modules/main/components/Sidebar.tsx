import {
  SvgCards,
  SvgHistory,
  SvgHome,
  SvgLogout,
  SvgProfile,
  SvgSettings,
} from '@components/Icons';
import { useAuth } from '@hooks/useAuth';
import { useRootActions } from '@hooks/useRootActions';
import { useWalletCards } from '@hooks/useWalletCards';

const navItems = [
  { id: 'home', label: 'Overview', Icon: SvgHome },
  { id: 'cards', label: 'Cards', Icon: SvgCards },
  { id: 'history', label: 'History', Icon: SvgHistory },
  { id: 'profile', label: 'Profile', Icon: SvgProfile },
  { id: 'settings', label: 'Settings', Icon: SvgSettings },
];

type Props = {
  activeNav: string;
};

export const Sidebar = ({ activeNav }: Props) => {
  const { username, logout } = useAuth();
  const { cardTheme } = useWalletCards();
  const { setActiveNav } = useRootActions();

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        background: '#0c0c1a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
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
            borderRadius: 10,
            background: `linear-gradient(135deg, ${cardTheme.a}, ${cardTheme.b})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            transition: 'background 0.6s',
          }}
        >
          ◈
        </div>
        <span
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em',
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
        {navItems.map(({ id, label, Icon }) => {
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
                borderRadius: 12,
                cursor: 'pointer',
                background: isActive ? `${cardTheme.dot}14` : 'transparent',
                border: 'none',
                width: '100%',
                transition: 'background 0.15s',
              }}
            >
              <Icon
                color={isActive ? cardTheme.dot : 'rgba(255,255,255,0.3)'}
                filled={isActive && id === 'home'}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? cardTheme.dot : 'rgba(255,255,255,0.4)',
                  transition: 'color 0.15s',
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
        })}
      </div>

      <div
        style={{
          padding: '20px 24px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            role="img"
            aria-label="profile-icon"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${cardTheme.a}88, ${cardTheme.b}88)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              transition: 'background 0.6s',
            }}
          >
            🧑
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {username || 'User'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
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
              borderRadius: 8,
            }}
            title="Logout"
          >
            <SvgLogout color="rgba(255,255,255,0.3)" />
          </button>
        </div>
      </div>
    </div>
  );
};
