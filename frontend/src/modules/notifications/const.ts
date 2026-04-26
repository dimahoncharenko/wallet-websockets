import { NotificationType } from 'types';

type NotificationConfig = {
  bg: string;
  color: string;
  label: string;
};

export const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  money_received: {
    bg: 'bg-emerald-500/20',
    color: 'text-emerald-400',
    label: 'Money received',
  },
  money_sent: {
    bg: 'bg-rose-500/20',
    color: 'text-rose-400',
    label: 'Transfer sent',
  },
  signin: {
    bg: 'bg-amber-500/20',
    color: 'text-amber-400',
    label: 'Sign-in',
  },
  security: {
    bg: 'bg-violet-500/20',
    color: 'text-violet-400',
    label: 'Security',
  },
};
