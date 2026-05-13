import { formatTransactionDate } from './helpers';

// Pin "today" to a known Saturday so every relative label is deterministic.
// 2024-06-15 = Saturday, 2024-06-10 = Monday (5 days prior), 2024-06-07 = Friday (8 days prior).
const TODAY = '2024-06-15T12:00:00';

describe('formatTransactionDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(TODAY));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Today" for a timestamp on the current date', () => {
    expect(formatTransactionDate('2024-06-15T08:30:00')).toBe('Today');
  });

  it('returns "Yesterday" for a timestamp on the previous date', () => {
    expect(formatTransactionDate('2024-06-14T23:59:00')).toBe('Yesterday');
  });

  it('returns the weekday name for a date 5 days ago (within 7-day window)', () => {
    // June 10 is exactly 5 days before June 15 noon — diffDays ≈ 5 < 7.
    expect(formatTransactionDate('2024-06-10T12:00:00')).toBe('Monday');
  });

  it('returns a short month-day label for dates older than 7 days', () => {
    // June 7 is 8 days before June 15 noon — diffDays ≈ 8 ≥ 7.
    expect(formatTransactionDate('2024-06-07T12:00:00')).toMatch(/Jun.+7/);
  });

  it('treats a timestamp on the 7-day boundary as recent (weekday), not old', () => {
    // Exactly 6 days prior — still inside the < 7 window.
    expect(formatTransactionDate('2024-06-09T12:00:00')).not.toMatch(/Jun.+9/);
  });
});
