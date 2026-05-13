import { getGreetings, percentageChange } from './helpers';

describe('getGreetings', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const setHour = (h: number) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, h, 0, 0));
  };

  it('returns "Good Morning" at 5am (lower boundary)', () => {
    setHour(5);
    expect(getGreetings()).toBe('Good Morning');
  });

  it('returns "Good Morning" at 11am (upper boundary)', () => {
    setHour(11);
    expect(getGreetings()).toBe('Good Morning');
  });

  it('returns "Good Afternoon" at 12pm (lower boundary)', () => {
    setHour(12);
    expect(getGreetings()).toBe('Good Afternoon');
  });

  it('returns "Good Afternoon" at 17 (upper boundary)', () => {
    setHour(17);
    expect(getGreetings()).toBe('Good Afternoon');
  });

  it('returns "Good Evening" at 18 (lower boundary)', () => {
    setHour(18);
    expect(getGreetings()).toBe('Good Evening');
  });

  it('returns "Good Evening" at 22 (upper boundary)', () => {
    setHour(22);
    expect(getGreetings()).toBe('Good Evening');
  });

  it('returns "Good Night" at 23', () => {
    setHour(23);
    expect(getGreetings()).toBe('Good Night');
  });

  it('returns "Good Night" at midnight (0)', () => {
    setHour(0);
    expect(getGreetings()).toBe('Good Night');
  });

  it('returns "Good Night" at 4am (just before morning)', () => {
    setHour(4);
    expect(getGreetings()).toBe('Good Night');
  });
});

describe('percentageChange', () => {
  it('returns "0%" for an empty array', () => {
    expect(percentageChange([])).toBe('0%');
  });

  it('returns "0%" for a single-element array', () => {
    expect(percentageChange([100])).toBe('0%');
  });

  it('returns "0%" when the first element is zero (avoids division by zero)', () => {
    expect(percentageChange([0, 100])).toBe('0%');
  });

  it('returns a positive percentage with "+" prefix', () => {
    expect(percentageChange([100, 150])).toBe('+50%');
  });

  it('returns a negative percentage without "+" prefix', () => {
    expect(percentageChange([100, 50])).toBe('-50%');
  });

  it('returns "+0%" when first and last values are equal', () => {
    expect(percentageChange([100, 100])).toBe('+0%');
  });

  it('rounds the percentage to the nearest integer', () => {
    // (133 - 100) / 100 * 100 = 33
    expect(percentageChange([100, 133])).toBe('+33%');
  });

  it('uses first and last elements only, ignoring middle values', () => {
    // (200 - 100) / 100 * 100 = 100
    expect(percentageChange([100, 50, 200])).toBe('+100%');
  });

  it('returns "-100%" when value drops to zero', () => {
    // (0 - 100) / 100 * 100 = -100
    expect(percentageChange([100, 0])).toBe('-100%');
  });
});
