import { renderHook, act } from '@testing-library/react';
import { useAddCardModal } from './useAddCardModal';

const mockSendAddCard = vi.fn();

vi.mock('@hooks/useRootActions', () => ({
  useRootActions: () => ({
    sendAddCard: mockSendAddCard,
    updateBalance: vi.fn(),
  }),
}));

describe('useAddCardModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSendAddCard.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('is not visible when closed', () => {
      const { result } = renderHook(() => useAddCardModal(false, vi.fn()));
      expect(result.current.isVisible).toBe(false);
    });

    it('starts on step 1 with an empty form', () => {
      const { result } = renderHook(() => useAddCardModal(false, vi.fn()));
      expect(result.current.step).toBe(1);
      expect(result.current.form.pan).toBe('');
      expect(result.current.form.holderName).toBe('');
    });

    it('is not loading', () => {
      const { result } = renderHook(() => useAddCardModal(false, vi.fn()));
      expect(result.current.loading).toBe(false);
    });
  });

  describe('open / close lifecycle', () => {
    it('becomes visible after open + requestAnimationFrame', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useAddCardModal(isOpen, vi.fn()),
        { initialProps: { isOpen: false } },
      );

      // First act flushes the effect that schedules the rAF (as a fake timer).
      act(() => { rerender({ isOpen: true }); });
      // Second act runs the fake rAF callback which calls setMounted(true).
      act(() => { vi.runAllTimers(); });

      expect(result.current.isVisible).toBe(true);
    });

    it('resets form to initial values 300 ms after closing', () => {
      const onClose = vi.fn();
      const { result, rerender } = renderHook(
        ({ isOpen }) => useAddCardModal(isOpen, onClose),
        { initialProps: { isOpen: true } },
      );

      act(() => { vi.runAllTimers(); }); // flush mount rAF

      act(() => {
        result.current.setForm((f) => ({ ...f, pan: '4111 1111 1111 1111' }));
      });

      expect(result.current.form.pan).toBe('4111 1111 1111 1111');

      act(() => { rerender({ isOpen: false }); }); // effect schedules 300 ms timeout
      act(() => { vi.advanceTimersByTime(300); });  // run the reset

      expect(result.current.form.pan).toBe('');
    });

    it('resets step to 1 after closing', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useAddCardModal(isOpen, vi.fn()),
        { initialProps: { isOpen: true } },
      );

      act(() => {
        result.current.handleNext();
        result.current.handleNext();
      });

      expect(result.current.step).toBe(3);

      act(() => { rerender({ isOpen: false }); });
      act(() => { vi.advanceTimersByTime(300); });

      expect(result.current.step).toBe(1);
    });
  });

  describe('Escape key', () => {
    it('calls onClose when Escape is pressed while open', () => {
      const onClose = vi.fn();
      renderHook(() => useAddCardModal(true, onClose));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose for other keys', () => {
      const onClose = vi.fn();
      renderHook(() => useAddCardModal(true, onClose));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('removes the listener when the modal closes', () => {
      const onClose = vi.fn();
      const { rerender } = renderHook(
        ({ isOpen }) => useAddCardModal(isOpen, onClose),
        { initialProps: { isOpen: true } },
      );

      rerender({ isOpen: false });

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('step navigation', () => {
    it('advances from step 1 → 2 → 3', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      act(() => result.current.handleNext());
      expect(result.current.step).toBe(2);
      act(() => result.current.handleNext());
      expect(result.current.step).toBe(3);
    });

    it('does not advance past step 3', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      act(() => {
        result.current.handleNext();
        result.current.handleNext();
        result.current.handleNext();
      });
      expect(result.current.step).toBe(3);
    });

    it('goes back from step 2 to step 1', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      act(() => result.current.handleNext());
      act(() => result.current.handleBack());
      expect(result.current.step).toBe(1);
    });

    it('does not go below step 1', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      act(() => result.current.handleBack());
      expect(result.current.step).toBe(1);
    });
  });

  describe('step1Valid', () => {
    it('is false with an empty form', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      expect(result.current.step1Valid).toBe(false);
    });

    it('is true with a valid PAN, future expiry, and 3-digit CVV', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      act(() => {
        result.current.setForm((f) => ({
          ...f,
          pan: '4111 1111 1111 1111',
          expiry: '12/99',
          cvv: '123',
        }));
      });
      expect(result.current.step1Valid).toBe(true);
    });

    it('is false when the Luhn check fails', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      act(() => {
        result.current.setForm((f) => ({
          ...f,
          pan: '4111 1111 1111 1112',
          expiry: '12/99',
          cvv: '123',
        }));
      });
      expect(result.current.step1Valid).toBe(false);
    });

    it('is false with an expired card', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      act(() => {
        result.current.setForm((f) => ({
          ...f,
          pan: '4111 1111 1111 1111',
          expiry: '01/00',
          cvv: '123',
        }));
      });
      expect(result.current.step1Valid).toBe(false);
    });

    it('is false with a CVV shorter than 3 digits', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      act(() => {
        result.current.setForm((f) => ({
          ...f,
          pan: '4111 1111 1111 1111',
          expiry: '12/99',
          cvv: '12',
        }));
      });
      expect(result.current.step1Valid).toBe(false);
    });
  });

  describe('step2Valid', () => {
    it('is false with an empty holderName', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      expect(result.current.step2Valid).toBe(false);
    });

    it('is true when holderName has non-whitespace content', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      act(() => {
        result.current.setForm((f) => ({ ...f, holderName: 'Jane Doe' }));
      });
      expect(result.current.step2Valid).toBe(true);
    });

    it('is false for a whitespace-only holderName', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));
      act(() => {
        result.current.setForm((f) => ({ ...f, holderName: '   ' }));
      });
      expect(result.current.step2Valid).toBe(false);
    });
  });

  describe('handleConfirm', () => {
    it('calls sendAddCard with the normalised payload', () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useAddCardModal(true, onClose));

      act(() => {
        result.current.setForm((f) => ({
          ...f,
          pan: '4111 1111 1111 1111',
          expiry: '12/25',
          holderName: 'jane doe',
          cardColor: 'rose',
        }));
      });

      act(() => result.current.handleConfirm());

      expect(mockSendAddCard).toHaveBeenCalledWith({
        pan: '4111111111111111',
        expiry: '12/25',
        holderName: 'JANE DOE',
        cardNetwork: 'visa',
        cardColor: 'rose',
      });
    });

    it('calls onClose after 700 ms', () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useAddCardModal(true, onClose));

      act(() => result.current.handleConfirm());
      expect(onClose).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(700));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('sets loading to true while processing', () => {
      const { result } = renderHook(() => useAddCardModal(true, vi.fn()));

      act(() => result.current.handleConfirm());
      expect(result.current.loading).toBe(true);
    });
  });
});
