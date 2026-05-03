import { AppNotification } from 'types';

export const formatTime = (iso: string) => {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const groupByDate = (notifications: AppNotification[]) => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  const groups: { label: string; items: AppNotification[] }[] = [];

  const todayItems = notifications.filter(
    (n) => new Date(n.timestamp).toDateString() === today,
  );
  const yesterdayItems = notifications.filter(
    (n) => new Date(n.timestamp).toDateString() === yesterday,
  );
  const earlierItems = notifications.filter((n) => {
    const d = new Date(n.timestamp).toDateString();
    return d !== today && d !== yesterday;
  });

  if (todayItems.length) groups.push({ label: 'TODAY', items: todayItems });
  if (yesterdayItems.length)
    groups.push({ label: 'YESTERDAY', items: yesterdayItems });
  if (earlierItems.length)
    groups.push({ label: 'EARLIER', items: earlierItems });

  return groups;
};
