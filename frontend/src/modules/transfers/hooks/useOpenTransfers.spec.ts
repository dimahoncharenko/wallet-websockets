import { renderHook, act } from '@testing-library/react';
import { useOpenTransfers } from './useOpenTransfers';

const makeProps = (overrides = {}) => ({
  isOpen: false,
  onClose: vi.fn(),
  setPan: vi.fn(),
  setAmount: vi.fn(),
  ...overrides,
});

describe('useOpenTransfers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('mounted state', () => {
    it('starts as false', () => {
      const { result } = renderHook(() => useOpenTransfers(makeProps()));
      expect(result.current.mounted).toBe(false);
    });

    it('becomes true when isOpen transitions to true', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useOpenTransfers(makeProps({ isOpen })),
        { initialProps: { isOpen: false } },
      );

      act(() => {
        rerender({ isOpen: true });
      });

      expect(result.current.mounted).toBe(true);
    });

    it('becomes false immediately when isOpen transitions to false', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useOpenTransfers(makeProps({ isOpen })),
        { initialProps: { isOpen: true } },
      );

      act(() => {
        rerender({ isOpen: false });
      });

      expect(result.current.mounted).toBe(false);
    });
  });

  describe('field clearing on close', () => {
    it('does not clear fields immediately when isOpen becomes false', () => {
      const setPan = vi.fn();
      const setAmount = vi.fn();

      const { rerender } = renderHook(
        ({ isOpen }) =>
          useOpenTransfers(makeProps({ isOpen, setPan, setAmount })),
        { initialProps: { isOpen: true } },
      );

      act(() => {
        rerender({ isOpen: false });
      });

      expect(setPan).not.toHaveBeenCalled();
      expect(setAmount).not.toHaveBeenCalled();
    });

    it('clears pan and amount after 300 ms', () => {
      const setPan = vi.fn();
      const setAmount = vi.fn();

      const { rerender } = renderHook(
        ({ isOpen }) =>
          useOpenTransfers(makeProps({ isOpen, setPan, setAmount })),
        { initialProps: { isOpen: true } },
      );

      act(() => {
        rerender({ isOpen: false });
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(setPan).toHaveBeenCalledWith('');
      expect(setAmount).toHaveBeenCalledWith('');
    });
  });

  describe('Escape key handling', () => {
    it('calls onClose when Escape is pressed while open', () => {
      const onClose = vi.fn();
      renderHook(() => useOpenTransfers(makeProps({ isOpen: true, onClose })));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when Escape is pressed while closed', () => {
      const onClose = vi.fn();
      renderHook(() => useOpenTransfers(makeProps({ isOpen: false, onClose })));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose for non-Escape keys while open', () => {
      const onClose = vi.fn();
      renderHook(() => useOpenTransfers(makeProps({ isOpen: true, onClose })));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('removes the keydown listener after isOpen becomes false', () => {
      const onClose = vi.fn();
      const { rerender } = renderHook(
        ({ isOpen }) =>
          useOpenTransfers(makeProps({ isOpen, onClose })),
        { initialProps: { isOpen: true } },
      );

      act(() => {
        rerender({ isOpen: false });
      });
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
