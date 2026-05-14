import { renderHook } from '@testing-library/react';
import { useBudget } from './useBudget';

describe('useBudget', () => {
  describe('budget', () => {
    it('uses income as budget when income is positive', () => {
      const { result } = renderHook(() =>
        useBudget({ income: 3000, spending: 0 }),
      );
      expect(result.current.budget).toBe(3000);
    });

    it('falls back to 5000 when income is 0', () => {
      const { result } = renderHook(() =>
        useBudget({ income: 0, spending: 0 }),
      );
      expect(result.current.budget).toBe(5000);
    });

    it('falls back to 5000 when income is negative', () => {
      const { result } = renderHook(() =>
        useBudget({ income: -500, spending: 0 }),
      );
      expect(result.current.budget).toBe(5000);
    });
  });

  describe('percentage', () => {
    it('returns the rounded percentage of spending vs budget', () => {
      const { result } = renderHook(() =>
        useBudget({ income: 1000, spending: 500 }),
      );
      expect(result.current.percentage).toBe(50);
    });

    it('rounds the percentage to the nearest integer', () => {
      // (333 / 1000) * 100 = 33.3 → 33
      const { result } = renderHook(() =>
        useBudget({ income: 1000, spending: 333 }),
      );
      expect(result.current.percentage).toBe(33);
    });

    it('caps percentage at 100 when spending exceeds budget', () => {
      const { result } = renderHook(() =>
        useBudget({ income: 1000, spending: 2000 }),
      );
      expect(result.current.percentage).toBe(100);
    });

    it('returns 0 when there is no spending', () => {
      const { result } = renderHook(() =>
        useBudget({ income: 1000, spending: 0 }),
      );
      expect(result.current.percentage).toBe(0);
    });

    it('uses the 5000 fallback in the percentage calculation when income is 0', () => {
      // 2500 / 5000 * 100 = 50
      const { result } = renderHook(() =>
        useBudget({ income: 0, spending: 2500 }),
      );
      expect(result.current.percentage).toBe(50);
    });

    it('returns 100 at exact budget limit', () => {
      const { result } = renderHook(() =>
        useBudget({ income: 1000, spending: 1000 }),
      );
      expect(result.current.percentage).toBe(100);
    });
  });

  describe('remaining', () => {
    it('returns budget minus spending', () => {
      const { result } = renderHook(() =>
        useBudget({ income: 1000, spending: 300 }),
      );
      expect(result.current.remaining).toBe(700);
    });

    it('returns 0 when spending equals budget', () => {
      const { result } = renderHook(() =>
        useBudget({ income: 1000, spending: 1000 }),
      );
      expect(result.current.remaining).toBe(0);
    });

    it('returns 0 when spending exceeds budget (does not go negative)', () => {
      const { result } = renderHook(() =>
        useBudget({ income: 1000, spending: 1500 }),
      );
      expect(result.current.remaining).toBe(0);
    });

    it('uses the 5000 fallback in the remaining calculation when income is 0', () => {
      const { result } = renderHook(() =>
        useBudget({ income: 0, spending: 2000 }),
      );
      expect(result.current.remaining).toBe(3000);
    });
  });
});
