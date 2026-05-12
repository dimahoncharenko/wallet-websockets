import { CardNetwork } from 'types';

export const luhn = (accountNumber: string) => {
  const digitsOnly = accountNumber.replace(/\D/g, '');

  if (digitsOnly.length < 12) {
    return false;
  }

  let totalSum = 0;
  let shouldDouble = false;

  // Iterate backwards from the last digit
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let currentDigit = Number(digitsOnly[i]);

    if (shouldDouble) {
      currentDigit *= 2;

      // If doubling results in a two-digit number, subtract 9 (equivalent to adding the digits)
      if (currentDigit > 9) {
        currentDigit -= 9;
      }
    }

    totalSum += currentDigit;
    shouldDouble = !shouldDouble;
  }

  return totalSum % 10 === 0;
};

export const detectNetwork = (pan: string): CardNetwork => {
  const d = pan.replace(/\D/g, '');

  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) {
    return 'mastercard';
  }

  return 'visa';
};

export const formatPan = (raw: string) => {
  return raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
};

export const formatExpiry = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 4);

  if (d.length >= 3) {
    return `${d.slice(0, 2)}/${d.slice(2)}`;
  }

  return d;
};

export const validateExpiry = (expiry: string): boolean => {
  const [monthStr, yearStr] = expiry.split('/');

  if (!monthStr || !yearStr || yearStr.length < 2) {
    return false;
  }

  const month = parseInt(monthStr, 10);

  if (month < 1 || month > 12) {
    return false;
  }

  const expiryYear = 2000 + parseInt(yearStr, 10);
  const expiryDate = new Date(expiryYear, month - 1);

  const currentDate = new Date();
  // Strip the day/time from the current date to ensure we only compare Year and Month
  const currentMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );

  // Check if the expiry date is in the current month or the future
  return expiryDate >= currentMonthStart;
};
