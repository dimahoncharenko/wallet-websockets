import { colors } from '@lib/theme';

type Props = {
  unreadCount: number;
  markAllRead: () => void;
};

export const Header = ({ unreadCount, markAllRead }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 0 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: colors.textPrimary,
            letterSpacing: '-0.02em',
          }}
        >
          Notifications
        </span>
        {unreadCount > 0 && (
          <div
            style={{
              background: '#a78bfa',
              color: '#000',
              fontSize: 10,
              fontWeight: 700,
              width: 18,
              height: 18,
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount}
          </div>
        )}
      </div>
      {unreadCount > 0 && (
        <button
          onClick={markAllRead}
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#a78bfa',
            cursor: 'pointer',
            opacity: 0.85,
          }}
        >
          Mark all read
        </button>
      )}
    </div>
  );
};
