import { useEffect, useState } from 'react';
import { CardColor, CardData } from 'types';

export const useCardColor = (pan: CardData['pan']) => {
  const [cardColor, setCardColor] = useState<CardColor>(
    (localStorage.getItem(`card-color-${pan}`) as CardColor) || 'violet',
  );

  useEffect(() => {
    setCardColor(
      (localStorage.getItem(`card-color-${pan}`) as CardColor) || 'violet',
    );

    const handleColorChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ pan: string; color: CardColor }>;
      if (customEvent.detail.pan === pan) {
        setCardColor(customEvent.detail.color);
      }
    };

    window.addEventListener('card-color-change', handleColorChange);
    return () => {
      window.removeEventListener('card-color-change', handleColorChange);
    };
  }, [pan]);

  const changeCardColor = (pan: CardData['pan'], color: CardColor) => {
    setCardColor(color);
    localStorage.setItem(`card-color-${pan}`, color);
    window.dispatchEvent(
      new CustomEvent('card-color-change', { detail: { pan, color } })
    );
  };

  return { cardColor, changeCardColor };
};
