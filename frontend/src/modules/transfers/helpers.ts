export const maskPan = (value: string) => {
  let formatted = '';

  for (let i = 0; i < value.length; i += 4) {
    formatted += value.substring(i, i + 4) + ' ';
  }

  return formatted.trim();
};
