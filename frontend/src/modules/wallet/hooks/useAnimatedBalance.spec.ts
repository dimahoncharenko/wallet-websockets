import { renderHook, act } from '@testing-library/react';
import { useAnimatedBalance } from './useAnimatedBalance';

describe('useAnimatedBalance', () => {
  it('returns the provided initial value immediately', () => {
    const { result } = renderHook(() => useAnimatedBalance(500));
    expect(result.current).toBe(500);
  });

  it('defaults to 0 when no value is provided', () => {
    const { result } = renderHook(() => useAnimatedBalance());
    expect(result.current).toBe(0);
  });

  it('reaches the target value once the animation completes', () => {
    // Timestamps: first frame=100, second frame=900 → (900-100)/800=1 → done.
    // callCount is reset before the rerender so each animation sequence starts fresh.
    let callCount = 0;
    const rafSpy = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        const n = callCount++; // increment before calling cb to prevent infinite recursion
        cb(n === 0 ? 100 : 900);
        return n + 1;
      });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => ({}));

    const { result, rerender } = renderHook(
      ({ val }) => useAnimatedBalance(val, 800),
      { initialProps: { val: 0 } },
    );

    callCount = 0; // reset so the val=1000 animation gets the first-frame timestamp
    act(() => {
      rerender({ val: 1000 });
    });

    expect(result.current).toBe(1000);
    rafSpy.mockRestore();
  });

  it('snaps exactly to the new value on the final frame (no floating-point drift)', () => {
    let callCount = 0;
    const rafSpy = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        const n = callCount++;
        cb(n === 0 ? 100 : 500); // (500-100)/400=1 → done
        return n + 1;
      });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => ({}));

    const { result, rerender } = renderHook(
      ({ val }) => useAnimatedBalance(val, 400),
      { initialProps: { val: 0 } },
    );

    callCount = 0;
    act(() => {
      rerender({ val: 99.99 });
    });

    expect(result.current).toBe(99.99);
    rafSpy.mockRestore();
  });
});
