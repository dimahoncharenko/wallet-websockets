export const getGreetings = () => {
  const h = new Date().getHours();

  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 18) return 'Good Afternoon';
  if (h >= 18 && h < 23) return 'Good Evening';

  return 'Good Night';
};

export const percentageChange = (arr: number[]): string => {
  if (arr.length < 2 || arr[0] === 0) return '0%';
  const delta = Math.round(((arr[arr.length - 1] - arr[0]) / arr[0]) * 100);
  return delta >= 0 ? `+${delta}%` : `${delta}%`;
};
