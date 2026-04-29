export const getGreetings = () => {
  const h = new Date().getHours();

  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 18) return 'Good Afternoon';
  if (h >= 18 && h < 23) return 'Good Evening';

  return 'Good Night';
};
