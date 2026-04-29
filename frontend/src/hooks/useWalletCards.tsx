import { CARD_THEMES, CardTheme } from '@modules/wallet/const';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react';
import { CardColor, CardData } from 'types';

type Context = {
  cards: CardData[];
  currentCard: CardData | null;
  setCards: Dispatch<SetStateAction<CardData[]>>;
  setActiveCardIndex: (index: number) => void;
  activeCardIndex: number;
  cardTheme: CardTheme;
  setColor: (pan: string, color: CardColor) => void;
  colors: ColorMap;
};

type ColorMap = Record<string, CardColor>;

const context = createContext<Context | undefined>(undefined);

export const useWalletCards = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error('useWalletCards must be used within a WalletCardsProvider');
  }
  return contextValue;
};

export const WalletCardsProvider = ({ children }: { children: ReactNode }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cards, setCards] = useState<CardData[]>([]);
  const [colors, setColors] = useState<ColorMap>(loadFromStorage);

  const setColor = useCallback((pan: string, color: CardColor) => {
    localStorage.setItem(`card-color-${pan}`, color);
    setColors((prev) => ({ ...prev, [pan]: color }));
    setCards((prev) =>
      prev.map((card) => (card.pan === pan ? { ...card, cardColor: color } : card)),
    );
  }, []);

  const currentCard =
    cards.length > 0 ? (cards[activeCardIndex] ?? cards[0]) : null;

  const activeColor = currentCard
    ? (colors[currentCard.pan] ?? currentCard.cardColor ?? 'violet')
    : 'violet';
  const cardTheme = CARD_THEMES[activeColor];

  return (
    <context.Provider
      value={{
        cards,
        setCards,
        setActiveCardIndex,
        currentCard,
        activeCardIndex,
        cardTheme,
        setColor,
        colors,
      }}
    >
      {children}
    </context.Provider>
  );
};

function loadFromStorage(): ColorMap {
  const map: ColorMap = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('card-color-')) {
      map[key.slice('card-color-'.length)] = localStorage.getItem(
        key,
      ) as CardColor;
    }
  }
  return map;
}
