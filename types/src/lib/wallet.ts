export type CardColor = 'violet' | 'emerald' | 'rose' | 'midnight';
export type CardNetwork = 'visa' | 'mastercard';

export interface CardData {
  holderName: string;
  pan: string;
  balance: number;
  currency: string;
  expiry: string;
  cardNetwork: CardNetwork;
  cardColor?: CardColor;
}

export interface WalletCardProps {
  card: CardData;
}

export interface WalletProps {
  cards: CardData[];
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onAddCard?: () => void;
}
