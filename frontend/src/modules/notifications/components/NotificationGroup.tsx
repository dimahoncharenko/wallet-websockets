import { AppNotification } from 'types';
import { formatTime } from '../helpers';
import { colors } from '@lib/theme';

const NOTIF_ICON: Record<string, string> = {
  signin: '🔐',
  money_received: '💸',
  money_sent: '📤',
  system: '🎯',
};

type Props = {
  dismiss: (id: string) => void;
  groups: {
    label: string;
    items: AppNotification[];
  }[];
};

export const NotificationGroups = ({ dismiss, groups }: Props) => {
  return groups.map(({ label, items }) => (
    <div key={label}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.22)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          padding: '14px 0 6px',
        }}
      >
        {label}
      </div>
      {items.map((n: AppNotification, i: number) => (
        <div
          key={n.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 11,
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            animation: `notifIn 0.3s ease ${i * 0.04}s both`,
            paddingLeft: 14,
            position: 'relative',
          }}
        >
          {!n.interacted && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#a78bfa',
              }}
            />
          )}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              flexShrink: 0,
              background: n.interacted
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(255,255,255,0.07)',
              border: `1px solid ${n.interacted ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            {NOTIF_ICON[n.type] ?? '🔔'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 2,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: n.interacted ? 500 : 700,
                  color: n.interacted
                    ? 'rgba(255,255,255,0.55)'
                    : colors.textPrimary,
                }}
              >
                {n.title}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.22)',
                  flexShrink: 0,
                  marginLeft: 6,
                }}
              >
                {formatTime(n.timestamp)}
              </span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.45,
              }}
            >
              {n.description}
            </div>
          </div>
          <button
            onClick={() => dismiss(n.id)}
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  ));
};

const CloseIcon = () => {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 14 14"
      fill="none"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="1" y1="1" x2="13" y2="13" />
      <line x1="13" y1="1" x2="1" y2="13" />
    </svg>
  );
};
