import { useState, useEffect, createContext, useContext } from 'react';
import { AppNotification, NotificationType } from 'types';
import toast from 'react-hot-toast';
import { useWebsocket } from './useWebsocket';

type NotificationsContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  dismiss: (id: string) => void;
};

const context = createContext<NotificationsContextType | undefined>(undefined);

function makeNotification(
  type: NotificationType,
  title: string,
  description: string,
): AppNotification {
  return {
    id: `${Date.now()}-${Math.random()}`,
    type,
    title,
    description,
    timestamp: new Date().toISOString(),
    interacted: false,
  };
}

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { socket } = useWebsocket();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!socket) return;

    const onOpen = () => {
      setNotifications((prev) => [
        makeNotification(
          'signin',
          'New sign-in detected',
          'Your account was accessed from this device.',
        ),
        ...prev,
      ]);
    };

    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event !== 'change-balance') return;

        const msg: string = data.message ?? 'Balance changed.';
        const isIncoming = !msg.toLowerCase().includes('sent') &&
          !msg.toLowerCase().includes('transfer') &&
          !msg.toLowerCase().includes('debit');

        if (msg.toLowerCase().includes('fail')) {
          toast.error(msg);
        } else {
          toast.success(msg);
        }

        setNotifications((prev) => [
          makeNotification(
            isIncoming ? 'money_received' : 'money_sent',
            isIncoming ? 'Money received' : 'Transfer sent',
            msg,
          ),
          ...prev,
        ]);
      } catch {
        // ignore malformed messages
      }
    };

    if (socket.readyState === WebSocket.OPEN) {
      onOpen();
    } else {
      socket.addEventListener('open', onOpen, { once: true });
    }

    socket.addEventListener('message', onMessage);

    return () => {
      socket.removeEventListener('open', onOpen);
      socket.removeEventListener('message', onMessage);
    };
  }, [socket]);

  const unreadCount = notifications.filter((n) => !n.interacted).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, interacted: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <context.Provider value={{ notifications, unreadCount, markAllRead, dismiss }}>
      {children}
    </context.Provider>
  );
};

export const useNotifications = () => {
  const value = useContext(context);
  if (!value) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return value;
};
