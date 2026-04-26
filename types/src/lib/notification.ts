export type NotificationType = 'money_received' | 'money_sent' | 'signin' | 'security';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  interacted: boolean;
}
