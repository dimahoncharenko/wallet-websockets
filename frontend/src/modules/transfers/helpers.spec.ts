import { maskPan } from './helpers';

describe('maskPan', () => {
  it('returns an empty string for empty input', () => {
    expect(maskPan('')).toBe('');
  });

  it('returns a 4-digit string unchanged', () => {
    expect(maskPan('1234')).toBe('1234');
  });

  it('inserts a space after every 4 characters', () => {
    expect(maskPan('12345678')).toBe('1234 5678');
  });

  it('formats a full 16-digit PAN correctly', () => {
    expect(maskPan('1234567890123456')).toBe('1234 5678 9012 3456');
  });

  it('does not add a trailing space', () => {
    expect(maskPan('1234567890123456')).not.toMatch(/ $/);
  });
});
