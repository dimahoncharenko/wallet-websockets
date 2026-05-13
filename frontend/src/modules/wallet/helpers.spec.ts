import { luhn, detectNetwork, formatPan, formatExpiry, validateExpiry } from './helpers';

describe('luhn', () => {
  it('passes for a known valid Visa test number', () => {
    expect(luhn('4111111111111111')).toBe(true);
  });

  it('passes when PAN contains spaces', () => {
    expect(luhn('4111 1111 1111 1111')).toBe(true);
  });

  it('fails for a number with a single corrupted digit', () => {
    expect(luhn('4111111111111112')).toBe(false);
  });

  it('fails for a sequential number that does not satisfy the checksum', () => {
    expect(luhn('1234567890123456')).toBe(false);
  });
});

describe('detectNetwork', () => {
  it('returns "mastercard" for 51–55 prefix', () => {
    expect(detectNetwork('5100000000000000')).toBe('mastercard');
    expect(detectNetwork('5500000000000000')).toBe('mastercard');
  });

  it('returns "mastercard" for 22–27 prefix', () => {
    expect(detectNetwork('2221000000000000')).toBe('mastercard');
    expect(detectNetwork('2720000000000000')).toBe('mastercard');
  });

  it('returns "visa" for a 4-prefix number', () => {
    expect(detectNetwork('4111111111111111')).toBe('visa');
  });

  it('returns "visa" as fallback for unrecognised prefixes', () => {
    expect(detectNetwork('6011000000000000')).toBe('visa');
  });

  it('strips non-digit characters before matching', () => {
    expect(detectNetwork('5100 0000 0000 0000')).toBe('mastercard');
  });
});

describe('formatPan', () => {
  it('groups 16 digits into four space-separated groups', () => {
    expect(formatPan('4111111111111111')).toBe('4111 1111 1111 1111');
  });

  it('strips non-digit characters', () => {
    expect(formatPan('4111-1111-1111-1111')).toBe('4111 1111 1111 1111');
  });

  it('truncates input to 16 digits', () => {
    expect(formatPan('41111111111111119999')).toBe('4111 1111 1111 1111');
  });

  it('handles partial input without trailing space', () => {
    expect(formatPan('4111')).toBe('4111');
    expect(formatPan('41111')).toBe('4111 1');
  });

  it('returns empty string for empty input', () => {
    expect(formatPan('')).toBe('');
  });
});

describe('formatExpiry', () => {
  it('inserts a slash after two digits', () => {
    expect(formatExpiry('1225')).toBe('12/25');
  });

  it('handles already-formatted input', () => {
    expect(formatExpiry('12/25')).toBe('12/25');
  });

  it('returns the raw digits unchanged when fewer than 3 digits are present', () => {
    expect(formatExpiry('1')).toBe('1');
    expect(formatExpiry('12')).toBe('12');
  });

  it('returns empty string for empty input', () => {
    expect(formatExpiry('')).toBe('');
  });
});

describe('validateExpiry', () => {
  it('returns true for a far-future expiry', () => {
    expect(validateExpiry('12/99')).toBe(true);
  });

  it('returns false for a clearly expired card', () => {
    expect(validateExpiry('01/00')).toBe(false);
  });

  it('returns false for month 0', () => {
    expect(validateExpiry('00/30')).toBe(false);
  });

  it('returns false for month 13', () => {
    expect(validateExpiry('13/30')).toBe(false);
  });

  it('returns false when the year string is a single digit', () => {
    expect(validateExpiry('12/2')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validateExpiry('')).toBe(false);
  });
});
