import { CARD_THEMES, CardTheme } from '@modules/wallet/const';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { CardColor, CardData, StatData } from 'types';
import { useWebsocket } from './useWebsocket';

type Context = {
  cards: CardData[];
  currentCard: CardData | null;
  setCards: Dispatch<SetStateAction<CardData[]>>;
  setActiveCardIndex: (index: number) => void;
  activeCardIndex: number;
  cardTheme: CardTheme;
  setColor: (pan: string, color: CardColor) => void;
  colors: ColorMap;
  income: StatData;
  setIncome: Dispatch<SetStateAction<StatData>>;
  spending: StatData;
  setSpending: Dispatch<SetStateAction<StatData>>;
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
  const { socket } = useWebsocket();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cards, setCards] = useState<CardData[]>([]);
  const [colors, setColors] = useState<ColorMap>(loadFromStorage);
  const [income, setIncome] = useState<StatData>({ value: 0, sparkline: [0] });
  const [spending, setSpending] = useState<StatData>({
    value: 0,
    sparkline: [0],
  });

  const setColor = useCallback((pan: string, color: CardColor) => {
    localStorage.setItem(`card-color-${pan}`, color);
    setColors((prev) => ({ ...prev, [pan]: color }));
    setCards((prev) =>
      prev.map((card) =>
        card.pan === pan ? { ...card, cardColor: color } : card,
      ),
    );
  }, []);

  const currentCard =
    cards.length > 0 ? (cards[activeCardIndex] ?? cards[0]) : null;

  const activeColor = currentCard
    ? (colors[currentCard.pan] ?? currentCard.cardColor ?? 'violet')
    : 'violet';
  const cardTheme = CARD_THEMES[activeColor];

  useEffect(() => {
    setIncome({ value: 0, sparkline: [0] });
    setSpending({ value: 0, sparkline: [0] });
  }, [currentCard?.pan]);

  useEffect(() => {
    if (!socket || !currentCard) return;
    const handler = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.event === 'update-stats' && msg.pan === currentCard.pan) {
          setIncome(msg.income);
          setSpending(msg.spending);
        }
      } catch {
        /* ignore */
      }
    };
    socket.addEventListener('message', handler);
    return () => socket.removeEventListener('message', handler);
  }, [socket, currentCard?.pan]);

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
        setIncome,
        setSpending,
        spending,
        income,
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
