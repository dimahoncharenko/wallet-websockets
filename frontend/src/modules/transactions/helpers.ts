export const formatTransactionDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const dateStr = date.toDateString();

  if (dateStr === today.toDateString()) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toDateString()) return 'Yesterday';

  const diffDays = (today.getTime() - date.getTime()) / (1000 * 3600 * 24);
  if (diffDays < 7)
    return date.toLocaleDateString(undefined, { weekday: 'long' });

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
