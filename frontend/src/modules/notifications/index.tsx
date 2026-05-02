import { useEffect, useRef } from 'react';
import { AppNotification } from 'types';
import { useNotifications } from '@hooks/useNotifications';
import { useModal } from '@hooks/useModal';
import { formatSectionDate, formatTime, groupByDate } from './helpers';
import { colors } from '@lib/theme';

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
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
}

const NOTIF_ICON: Record<string, string> = {
  signin: '🔐',
  money_received: '💸',
  money_sent: '📤',
  system: '🎯',
};

export function NotificationsPanel() {
  const { notifications, unreadCount, markAllRead, dismiss } =
    useNotifications();
  const { modals, setModal } = useModal();
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = modals.notificationsPanel;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal('notificationsPanel', false);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setModal('notificationsPanel', false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    setTimeout(() => document.addEventListener('mousedown', onClickOutside), 0);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [isOpen, setModal]);

  if (!isOpen) return null;

  const groups = groupByDate(notifications);

  const renderList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
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
          <h2
            id="notifications-panel-title"
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: colors.textPrimary,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Notifications
          </h2>
          {unreadCount > 0 && (
            <div
              aria-hidden="true"
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
            type="button"
            onClick={markAllRead}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#a78bfa',
              cursor: 'pointer',
              opacity: 0.85,
              background: 'none',
              border: 'none',
              padding: 0,
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
        {notifications.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 10,
              paddingTop: 40,
            }}
          >
            <div aria-hidden="true" style={{ fontSize: 32, opacity: 0.25 }}>🔔</div>
            <div
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.2)',
                fontWeight: 500,
              }}
            >
              All caught up
            </div>
          </div>
        ) : (
          groups.map(({ label, items }) => (
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
                      aria-hidden="true"
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
                    aria-hidden="true"
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
                    type="button"
                    onClick={() => dismiss(n.id)}
                    aria-label={`Dismiss: ${n.title}`}
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
          ))
        )}
      </div>
    </div>
  );

  return (
    <div
      id="notifications-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-panel-title"
      ref={panelRef}
      style={{
        position: 'fixed',
        top: 'calc(64px + 10px)',
        right: 16,
        width: 360,
        maxHeight: 480,
        background: '#0f0f22',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        boxShadow:
          '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        animation: 'popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 500,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          height: 2,
          background:
            'linear-gradient(90deg, transparent, #a78bfa88, transparent)',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, padding: '18px 20px 16px', overflowY: 'auto' }}>
        {renderList()}
      </div>
    </div>
  );
}
