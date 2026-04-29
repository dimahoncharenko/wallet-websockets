import { Transaction } from './transaction';
import { CardData } from './wallet';

export type WebsocketMessage =
  | InitBalance
  | InitCards
  | ChangeBalance
  | UpdateHistory
  | CardAdded
  | { event: 'ping'; holderName: string }
  | { event: 'add-card' }
  | { event: 'auth'; token: string }
  | { event: 'auth_result'; success: boolean; expiresIn: number }
  | { event: 'token_refresh'; token: string }
  | { event: 'token_refreshed'; success: boolean; expiresIn: number }
  | {
      event: 'proceed-transfer';
      amount: number;
      debitPan: string;
      creditPan: string;
    }
  | UpdateStats;

export interface InitBalance {
  event: 'init-card';
  card: CardData;
}

export interface InitCards {
  event: 'init-cards';
  cards: CardData[];
}

export interface CardAdded {
  event: 'card-added';
  card: CardData;
}

export interface ChangeBalance {
  event: 'change-balance';
  balance: string;
  creditPan: string;
  message?: string;
}

export interface UpdateHistory {
  event: 'update-history';
  transaction: Transaction;
}

export interface StatData {
  value: number;
  sparkline: number[];
}

export interface UpdateStats {
  event: 'update-stats';
  pan: string;
  income: StatData;
  spending: StatData;
}
