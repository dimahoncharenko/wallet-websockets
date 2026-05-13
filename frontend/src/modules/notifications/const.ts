import { AppNotification } from 'types';

export const NOTIFICATION_ICONS: Record<AppNotification['type'], string> = {
  signin: '🔐',
  money_received: '💸',
  money_sent: '📤',
  security: '🛡️',
};
