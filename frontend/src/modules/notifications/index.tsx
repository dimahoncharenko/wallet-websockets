import { useEffect, useRef } from 'react';
import { AppNotification } from 'types';
import { useNotifications } from '@hooks/useNotifications';
import { useModal } from '@hooks/useModal';
import './notifications.css';
import { NOTIFICATION_CONFIG } from './const';
import { formatSectionDate, formatTime, groupByDate } from './helpers';
import { LockIcon } from './components/LockIcon';
import { ShieldIcon } from './components/ShieldIcon';
import { Empty } from './components/Empty';
import { NotificationGroup } from './components/NotificationGroup';
import { Header } from './components/Header';

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
    document.addEventListener('mousedown', onClickOutside);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [isOpen, setModal]);

  if (!isOpen) return null;

  const groups = groupByDate(notifications);

  return (
    <div
      ref={panelRef}
      className="fixed top-16 right-4 w-80 z-50 rounded-3xl bg-slate-900/95 border overflow-clip border-white/10 backdrop-blur-xl shadow-2xl"
      style={{
        animation: 'notif-in 0.18s ease-out both',
      }}
    >
      <Header markAllRead={markAllRead} unreadCount={unreadCount} />

      <div className="max-h-[70vh] overflow-y-auto">
        {groups.length === 0 ? (
          <Empty />
        ) : (
          groups.map((group, gi) => (
            <div key={group.label}>
              <p className="px-5 py-2 text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                {group.label}
              </p>

              <NotificationGroup group={group} dismiss={dismiss} />

              {gi < groups.length - 1 && (
                <div className="border-t border-white/[0.06] mx-4 mt-1" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="pb-2" />
    </div>
  );
}
