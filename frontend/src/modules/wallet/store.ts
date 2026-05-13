import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CardColor, CardData, StatData } from 'types';

type ColorMap = Record<string, CardColor>;

type WalletState = {
  cards: CardData[];
  activeCardIndex: number;
  colors: ColorMap;
  income: StatData;
  spending: StatData;
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    cards: [],
    activeCardIndex: 0,
    colors: {},
    income: { value: 0, sparkline: [0] },
    spending: { value: 0, sparkline: [0] },
  } as WalletState,
  reducers: {
    setCards(state, action: PayloadAction<CardData[]>) {
      state.cards = action.payload;
    },
    addCard(state, action: PayloadAction<CardData>) {
      state.cards.push(action.payload);
    },
    updateCardBalance(state, action: PayloadAction<{ pan: string; delta: number }>) {
      const card = state.cards.find((c) => c.pan === action.payload.pan);
      if (card) card.balance += action.payload.delta;
    },
    setActiveCardIndex(state, action: PayloadAction<number>) {
      state.activeCardIndex = action.payload;
      state.income = { value: 0, sparkline: [0] };
      state.spending = { value: 0, sparkline: [0] };
    },
    setCardColor(state, action: PayloadAction<{ pan: string; color: CardColor }>) {
      const { pan, color } = action.payload;
      state.colors[pan] = color;
      const card = state.cards.find((c) => c.pan === pan);
      if (card) card.cardColor = color;
    },
    setIncome(state, action: PayloadAction<StatData>) {
      state.income = action.payload;
    },
    setSpending(state, action: PayloadAction<StatData>) {
      state.spending = action.payload;
    },
  },
});

export const {
  setCards,
  addCard,
  updateCardBalance,
  setActiveCardIndex,
  setCardColor,
  setIncome,
  setSpending,
} = walletSlice.actions;

export default walletSlice.reducer;
