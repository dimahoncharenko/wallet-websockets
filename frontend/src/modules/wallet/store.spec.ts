import { configureStore } from '@reduxjs/toolkit';
import walletReducer, {
  addCard,
  setActiveCardIndex,
  setCardColor,
  setCards,
  setIncome,
  setSpending,
  updateCardBalance,
} from './store';
import type { CardData } from 'types';

const makeStore = () => configureStore({ reducer: walletReducer });

const card: CardData = {
  pan: '4111111111111111',
  holderName: 'JOHN DOE',
  balance: 1000,
  currency: '$',
  expiry: '12/25',
  cardNetwork: 'visa',
  cardColor: 'violet',
};

describe('wallet slice', () => {
  describe('setCards', () => {
    it('replaces the cards array', () => {
      const store = makeStore();
      store.dispatch(setCards([card]));
      expect(store.getState().cards).toEqual([card]);
    });

    it('overwrites previously stored cards', () => {
      const store = makeStore();
      store.dispatch(setCards([card]));
      const second: CardData = { ...card, pan: '5500005555555559' };
      store.dispatch(setCards([second]));
      expect(store.getState().cards).toHaveLength(1);
      expect(store.getState().cards[0].pan).toBe(second.pan);
    });
  });

  describe('addCard', () => {
    it('appends a card to the list', () => {
      const store = makeStore();
      store.dispatch(setCards([card]));
      const extra: CardData = { ...card, pan: '5500005555555559' };
      store.dispatch(addCard(extra));
      expect(store.getState().cards).toHaveLength(2);
      expect(store.getState().cards[1]).toEqual(extra);
    });
  });

  describe('updateCardBalance', () => {
    it('adds the delta to the matching card balance', () => {
      const store = makeStore();
      store.dispatch(setCards([card]));
      store.dispatch(updateCardBalance({ pan: card.pan, delta: 500 }));
      expect(store.getState().cards[0].balance).toBe(1500);
    });

    it('subtracts when delta is negative', () => {
      const store = makeStore();
      store.dispatch(setCards([card]));
      store.dispatch(updateCardBalance({ pan: card.pan, delta: -200 }));
      expect(store.getState().cards[0].balance).toBe(800);
    });

    it('does nothing for an unknown PAN', () => {
      const store = makeStore();
      store.dispatch(setCards([card]));
      store.dispatch(updateCardBalance({ pan: '9999999999999999', delta: 500 }));
      expect(store.getState().cards[0].balance).toBe(1000);
    });
  });

  describe('setActiveCardIndex', () => {
    it('updates the active index', () => {
      const store = makeStore();
      store.dispatch(setActiveCardIndex(2));
      expect(store.getState().activeCardIndex).toBe(2);
    });

    it('resets income and spending stats', () => {
      const store = makeStore();
      store.dispatch(setIncome({ value: 500, sparkline: [100, 200, 200] }));
      store.dispatch(setSpending({ value: 300, sparkline: [50, 100, 150] }));
      store.dispatch(setActiveCardIndex(1));
      expect(store.getState().income).toEqual({ value: 0, sparkline: [0] });
      expect(store.getState().spending).toEqual({ value: 0, sparkline: [0] });
    });
  });

  describe('setCardColor', () => {
    it('updates the color map entry', () => {
      const store = makeStore();
      store.dispatch(setCardColor({ pan: card.pan, color: 'rose' }));
      expect(store.getState().colors[card.pan]).toBe('rose');
    });

    it('also updates the card entity when it exists', () => {
      const store = makeStore();
      store.dispatch(setCards([card]));
      store.dispatch(setCardColor({ pan: card.pan, color: 'emerald' }));
      expect(store.getState().cards[0].cardColor).toBe('emerald');
    });

    it('only writes the color map when no card matches', () => {
      const store = makeStore();
      store.dispatch(setCardColor({ pan: '0000', color: 'midnight' }));
      expect(store.getState().colors['0000']).toBe('midnight');
      expect(store.getState().cards).toHaveLength(0);
    });
  });

  describe('setIncome', () => {
    it('stores the income stat', () => {
      const store = makeStore();
      const stat = { value: 1200, sparkline: [100, 200, 900] };
      store.dispatch(setIncome(stat));
      expect(store.getState().income).toEqual(stat);
    });
  });

  describe('setSpending', () => {
    it('stores the spending stat', () => {
      const store = makeStore();
      const stat = { value: 800, sparkline: [50, 150, 600] };
      store.dispatch(setSpending(stat));
      expect(store.getState().spending).toEqual(stat);
    });
  });
});
