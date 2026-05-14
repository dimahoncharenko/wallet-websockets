import { formatTime, groupByDate } from './helpers';
import type { AppNotification } from 'types';

// Pin "today" to June 15 2024 noon so date boundaries are deterministic.
// yesterday = June 14, earlier = June 10 (5 days prior).
const PIN_DATE = '2024-06-15T12:00:00';

let idSeq = 0;

const makeNotif = (
  timestamp: string,
  overrides: Partial<AppNotification> = {},
): AppNotification => ({
  id: `n${++idSeq}`,
  type: 'signin',
  title: 'Test',
  description: 'Test description',
  timestamp,
  interacted: false,
  ...overrides,
});

beforeEach(() => {
  idSeq = 0;
});

describe('formatTime', () => {
  it('returns a string matching HH:MM for a valid ISO timestamp', () => {
    expect(formatTime('2024-06-15T14:30:00')).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns a string for midnight (00:00)', () => {
    expect(formatTime('2024-06-15T00:00:00')).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns different values for two different times', () => {
    const morning = formatTime('2024-06-15T08:00:00');
    const evening = formatTime('2024-06-15T22:00:00');
    expect(morning).not.toBe(evening);
  });

  it('returns the same value for identical timestamps', () => {
    const ts = '2024-06-15T10:30:00';
    expect(formatTime(ts)).toBe(formatTime(ts));
  });
});

describe('groupByDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(PIN_DATE));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns an empty array for empty input', () => {
    expect(groupByDate([])).toEqual([]);
  });

  it('places a today notification into the TODAY group', () => {
    const n = makeNotif('2024-06-15T08:00:00');
    const groups = groupByDate([n]);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('TODAY');
    expect(groups[0].items).toEqual([n]);
  });

  it('places a yesterday notification into the YESTERDAY group', () => {
    const n = makeNotif('2024-06-14T20:00:00');
    const groups = groupByDate([n]);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('YESTERDAY');
    expect(groups[0].items).toEqual([n]);
  });

  it('places an older notification into the EARLIER group', () => {
    const n = makeNotif('2024-06-10T10:00:00');
    const groups = groupByDate([n]);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('EARLIER');
    expect(groups[0].items).toEqual([n]);
  });

  it('produces groups in TODAY → YESTERDAY → EARLIER order', () => {
    const today = makeNotif('2024-06-15T09:00:00');
    const yesterday = makeNotif('2024-06-14T09:00:00');
    const earlier = makeNotif('2024-06-10T09:00:00');
    const labels = groupByDate([today, yesterday, earlier]).map((g) => g.label);
    expect(labels).toEqual(['TODAY', 'YESTERDAY', 'EARLIER']);
  });

  it('omits TODAY when there are no today notifications', () => {
    const labels = groupByDate([makeNotif('2024-06-14T09:00:00')]).map(
      (g) => g.label,
    );
    expect(labels).not.toContain('TODAY');
  });

  it('omits YESTERDAY when there are no yesterday notifications', () => {
    const labels = groupByDate([makeNotif('2024-06-15T09:00:00')]).map(
      (g) => g.label,
    );
    expect(labels).not.toContain('YESTERDAY');
  });

  it('omits EARLIER when there are no older notifications', () => {
    const labels = groupByDate([makeNotif('2024-06-15T09:00:00')]).map(
      (g) => g.label,
    );
    expect(labels).not.toContain('EARLIER');
  });

  it('preserves the relative order of items within a group', () => {
    const first = makeNotif('2024-06-15T08:00:00', { id: 'a' });
    const second = makeNotif('2024-06-15T09:00:00', { id: 'b' });
    const groups = groupByDate([first, second]);
    expect(groups[0].items[0].id).toBe('a');
    expect(groups[0].items[1].id).toBe('b');
  });

  it('distributes items across all three groups correctly', () => {
    const items = [
      makeNotif('2024-06-15T10:00:00'),
      makeNotif('2024-06-14T10:00:00'),
      makeNotif('2024-06-14T11:00:00'),
      makeNotif('2024-06-10T10:00:00'),
    ];
    const groups = groupByDate(items);
    expect(groups).toHaveLength(3);
    expect(groups[0].items).toHaveLength(1); // TODAY
    expect(groups[1].items).toHaveLength(2); // YESTERDAY
    expect(groups[2].items).toHaveLength(1); // EARLIER
  });

  it('places a notification at the very end of yesterday correctly', () => {
    const n = makeNotif('2024-06-14T23:59:59');
    const groups = groupByDate([n]);
    expect(groups[0].label).toBe('YESTERDAY');
  });

  it('places a notification at the very start of today correctly', () => {
    const n = makeNotif('2024-06-15T00:00:00');
    const groups = groupByDate([n]);
    expect(groups[0].label).toBe('TODAY');
  });
});
