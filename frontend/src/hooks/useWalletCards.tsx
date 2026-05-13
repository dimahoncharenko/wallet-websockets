import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CARD_THEMES } from '@modules/wallet/const';
import { CardColor } from 'types';
import { setActiveCardIndex, setCardColor } from '@modules/wallet/store';
import type { RootState, AppDispatch } from '../modules/main/store';

export const useWalletCards = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cards, activeCardIndex, colors, income, spending } = useSelector(
    (state: RootState) => state.wallet,
  );

  const currentCard = cards.length > 0 ? (cards[activeCardIndex] ?? cards[0]) : null;
  const activeColor = currentCard
    ? (colors[currentCard.pan] ?? currentCard.cardColor ?? 'violet')
    : 'violet';
  const cardTheme = CARD_THEMES[activeColor];

  const setColor = useCallback(
    (pan: string, color: CardColor) => {
      dispatch(setCardColor({ pan, color }));
    },
    [dispatch],
  );

  return {
    cards,
    currentCard,
    activeCardIndex,
    setActiveCardIndex: (index: number) => dispatch(setActiveCardIndex(index)),
    cardTheme,
    setColor,
    colors,
    income,
    spending,
  };
};
