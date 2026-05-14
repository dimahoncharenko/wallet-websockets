import React from 'react';
import { renderHook, act, render, fireEvent } from '@testing-library/react';
import { useWalletSlider } from './useWalletSlider';
import type { CardData } from 'types';

const cards: CardData[] = [
  {
    pan: '4111111111111111',
    holderName: 'ALICE',
    balance: 1000,
    currency: '$',
    expiry: '12/25',
    cardNetwork: 'visa',
    cardColor: 'violet',
  },
  {
    pan: '5500005555555559',
    holderName: 'ALICE',
    balance: 2000,
    currency: '$',
    expiry: '06/26',
    cardNetwork: 'mastercard',
    cardColor: 'rose',
  },
  {
    pan: '4222222222222',
    holderName: 'ALICE',
    balance: 500,
    currency: '$',
    expiry: '03/27',
    cardNetwork: 'visa',
    cardColor: 'midnight',
  },
];

describe('useWalletSlider', () => {
  describe('activeIndex', () => {
    it('starts at 0 when no controlledIndex is given', () => {
      const { result } = renderHook(() => useWalletSlider({ cards }));
      expect(result.current.activeIndex).toBe(0);
    });

    it('uses controlledIndex when provided', () => {
      const { result } = renderHook(() =>
        useWalletSlider({ cards, controlledIndex: 2 }),
      );
      expect(result.current.activeIndex).toBe(2);
    });
  });

  describe('handleScroll', () => {
    it('updates internal activeIndex based on scroll position', () => {
      const { result } = renderHook(() => useWalletSlider({ cards }));

      // Simulate a scroll container 320px wide scrolled one card to the right.
      result.current.scrollRef.current = {
        scrollLeft: 320,
        clientWidth: 320,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as HTMLDivElement;

      act(() => result.current.handleScroll());

      expect(result.current.activeIndex).toBe(1);
    });

    it('calls onActiveIndexChange instead of updating internal state', () => {
      const onActiveIndexChange = vi.fn();
      const { result } = renderHook(() =>
        useWalletSlider({ cards, onActiveIndexChange }),
      );

      result.current.scrollRef.current = {
        scrollLeft: 320,
        clientWidth: 320,
      } as HTMLDivElement;

      act(() => result.current.handleScroll());

      expect(onActiveIndexChange).toHaveBeenCalledWith(1);
      // Internal state should stay at 0
      expect(result.current.activeIndex).toBe(0);
    });

    it('does nothing when scrollRef is null', () => {
      const { result } = renderHook(() => useWalletSlider({ cards }));
      // scrollRef.current is null by default
      expect(() => act(() => result.current.handleScroll())).not.toThrow();
    });
  });

  describe('scrollTo', () => {
    it('calls scrollRef.current.scrollTo with the correct left offset', () => {
      const { result } = renderHook(() => useWalletSlider({ cards }));
      const scrollToMock = vi.fn();

      result.current.scrollRef.current = {
        scrollTo: scrollToMock,
        clientWidth: 320,
      } as unknown as HTMLDivElement;

      act(() => result.current.scrollTo(1));

      expect(scrollToMock).toHaveBeenCalledWith({ left: 320, behavior: 'smooth' });
    });

    it('does nothing when scrollRef is null', () => {
      const { result } = renderHook(() => useWalletSlider({ cards }));
      expect(() => act(() => result.current.scrollTo(1))).not.toThrow();
    });
  });

  describe('keyboard navigation', () => {
    function Slider({
      controlledIndex,
      onActiveIndexChange,
    }: {
      controlledIndex?: number;
      onActiveIndexChange?: (i: number) => void;
    }) {
      const { scrollRef } = useWalletSlider({
        cards,
        controlledIndex,
        onActiveIndexChange,
      });
      return React.createElement('div', {
        ref: scrollRef,
        'data-testid': 'slider',
        tabIndex: 0,
      });
    }

    it('scrolls left on ArrowLeft', () => {
      const onActiveIndexChange = vi.fn();
      const { getByTestId } = render(
        React.createElement(Slider, { controlledIndex: 1, onActiveIndexChange }),
      );
      const el = getByTestId('slider');
      const scrollTo = vi.fn();
      el.scrollTo = scrollTo;
      Object.defineProperty(el, 'clientWidth', { value: 320, configurable: true });

      fireEvent.keyUp(el, { key: 'ArrowLeft' });

      expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' });
    });

    it('scrolls right on ArrowRight', () => {
      const onActiveIndexChange = vi.fn();
      const { getByTestId } = render(
        React.createElement(Slider, { controlledIndex: 0, onActiveIndexChange }),
      );
      const el = getByTestId('slider');
      const scrollTo = vi.fn();
      el.scrollTo = scrollTo;
      Object.defineProperty(el, 'clientWidth', { value: 320, configurable: true });

      fireEvent.keyUp(el, { key: 'ArrowRight' });

      expect(scrollTo).toHaveBeenCalledWith({ left: 320, behavior: 'smooth' });
    });

    it('does not scroll past the first card on ArrowLeft', () => {
      const onActiveIndexChange = vi.fn();
      const { getByTestId } = render(
        React.createElement(Slider, { controlledIndex: 0, onActiveIndexChange }),
      );
      const el = getByTestId('slider');
      const scrollTo = vi.fn();
      el.scrollTo = scrollTo;
      Object.defineProperty(el, 'clientWidth', { value: 320, configurable: true });

      fireEvent.keyUp(el, { key: 'ArrowLeft' });

      expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' });
    });

    it('does not scroll past the last card on ArrowRight', () => {
      const onActiveIndexChange = vi.fn();
      const { getByTestId } = render(
        React.createElement(Slider, {
          controlledIndex: cards.length - 1,
          onActiveIndexChange,
        }),
      );
      const el = getByTestId('slider');
      const scrollTo = vi.fn();
      el.scrollTo = scrollTo;
      Object.defineProperty(el, 'clientWidth', { value: 320, configurable: true });

      fireEvent.keyUp(el, { key: 'ArrowRight' });

      expect(scrollTo).toHaveBeenCalledWith({
        left: (cards.length - 1) * 320,
        behavior: 'smooth',
      });
    });
  });
});
