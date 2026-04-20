import { Transaction } from './transaction';
import { CardData } from './wallet';

export type WebsocketMessage =
  | InitBalance
  | ChangeBalance
  | UpdateHistory
  | { event: 'ping' }
  | { event: 'auth'; token: string }
  | { event: 'auth_result'; success: boolean; expiresIn: number }
  | { event: 'token_refresh'; token: string }
  | { event: 'token_refreshed'; success: boolean; expiresIn: number }
  | {
      event: 'proceed-transfer';
      amount: number;
      debitPan: string;
      creditPan: string;
    };

export interface InitBalance {
  event: 'init-card';
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
