import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useWebsocket } from './useWebsocket';
import {
  addNotification as addNotificationAction,
  markAllRead as markAllReadAction,
  dismissNotification,
} from '@modules/app/store';
import type { RootState, AppDispatch } from '../modules/main/store';
import { NotificationType } from 'types';

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useWebsocket();

  useEffect(() => {
    if (!socket) return;

    const onOpen = () => {
      dispatch(
        addNotificationAction(
          'signin',
          'New sign-in detected',
          'Your account was accessed from this device.',
        ),
      );
    };

    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event !== 'change-balance') return;

        const msg: string = data.message ?? 'Balance changed.';
        const isIncoming =
          !msg.toLowerCase().includes('sent') &&
          !msg.toLowerCase().includes('transfer') &&
          !msg.toLowerCase().includes('debit');

        if (msg.toLowerCase().includes('fail')) {
          toast.error(msg);
        } else {
          toast.success(msg);
        }

        dispatch(
          addNotificationAction(
            isIncoming ? 'money_received' : 'money_sent',
            isIncoming ? 'Money received' : 'Transfer sent',
            msg,
          ),
        );
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
  }, [socket, dispatch]);

  return children;
};

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(
    (state: RootState) => state.app.notifications,
  );
  const unreadCount = notifications.filter((n) => !n.interacted).length;

  return {
    notifications,
    unreadCount,
    addNotification: (
      type: NotificationType,
      title: string,
      description: string,
    ) => dispatch(addNotificationAction(type, title, description)),
    markAllRead: () => dispatch(markAllReadAction()),
    dismiss: (id: string) => dispatch(dismissNotification(id)),
  };
};
