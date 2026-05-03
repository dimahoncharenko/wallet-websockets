import { useEffect, useRef, useState } from 'react';
import { CardData } from 'types';

type Props = {
  controlledIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  cards: CardData[];
};

export const useWalletSlider = ({
  cards,
  controlledIndex,
  onActiveIndexChange,
}: Props) => {
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const activeIndex = controlledIndex ?? internalActiveIndex;

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    if (index !== activeIndex) {
      if (onActiveIndexChange) {
        onActiveIndexChange(index);
      } else {
        setInternalActiveIndex(index);
      }
    }
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        scrollTo(Math.max(0, activeIndex - 1));
      } else if (e.key === 'ArrowRight') {
        scrollTo(Math.min(cards.length - 1, activeIndex + 1));
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [activeIndex, cards.length]);

  return {
    scrollRef,
    scrollTo,
    handleScroll,
    activeIndex,
  };
};
