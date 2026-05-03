import { useNotifications } from '@hooks/useNotifications';
import { groupByDate } from './helpers';
import { Header } from './components/Header';
import { NotificationGroups } from './components/NotificationGroup';
import { Empty } from './components/Empty';
import { useNotificationsModal } from './hooks/useNotificationsModal';
import { useMediaQuery } from '@hooks/useMediaQuery';

export function NotificationsPanel() {
  const isDesktop = useMediaQuery();
  const { notifications, unreadCount, markAllRead, dismiss } =
    useNotifications();

  const { isOpen, ref } = useNotificationsModal();
  if (!isOpen) return null;

  const groups = groupByDate(notifications);

  const renderList = () => (
    <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
      {notifications.length === 0 ? (
        <Empty />
      ) : (
        <NotificationGroups groups={groups} dismiss={dismiss} />
      )}
    </div>
  );

  const top = isDesktop ? 64 : 92;

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top,
        right: 16,
        width: 'min(360px, calc(100vw - 32px))',
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
        style={{
          height: 2,
          background:
            'linear-gradient(90deg, transparent, #a78bfa88, transparent)',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, padding: '18px 20px 16px', overflowY: 'auto' }}>
        <div
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Header unreadCount={unreadCount} markAllRead={markAllRead} />
          {renderList()}
        </div>
      </div>
    </div>
  );
}
