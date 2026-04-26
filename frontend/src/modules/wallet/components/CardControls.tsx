import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { COLOR_OPTIONS } from '../const';
import { useCardColor } from '@hooks/useCardColor';
import { TransferModal } from '@components/TransferModal';
import { useWebsocket } from '@hooks/useWebsocket';
import { CardData } from 'types';

type Props = {
  card: CardData;
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
};

export const CardControls = ({ card, balance, setBalance }: Props) => {
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const { cardColor, changeCardColor } = useCardColor(card.pan);
  const { socket } = useWebsocket();

  const handleTransfer = (pan: string, amount: number) => {
    if (
      socket &&
      socket.readyState === WebSocket.OPEN &&
      balance - amount >= 0
    ) {
      socket.send(
        JSON.stringify({
          event: 'proceed-transfer',
          amount,
          debitPan: card.pan,
          creditPan: pan,
        }),
      );

      setBalance((prev) => Math.max(0, prev - amount));
    }
  };

  console.log('Card pan: ', { pan: card.pan, color: cardColor });

  return (
    <div className="flex items-center justify-between w-full max-w-sm">
      <button
        onClick={() => setIsTransferOpen(true)}
        className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 overflow-hidden transition-all hover:scale-105 active:scale-95"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 transition-transform group-hover:scale-110"></div>
        <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </span>
        <span className="relative">Transfer</span>
      </button>

      <div className="flex items-center gap-3 bg-white/5 p-2 rounded-full border border-white/5">
        {COLOR_OPTIONS.map(({ color, bg, ring }) => (
          <button
            key={color}
            onClick={() => changeCardColor(card.pan, color)}
            aria-label={`Switch to ${color} card`}
            className={`
              w-6 h-6 rounded-full transition-all duration-200
              ${bg}
              ${
                cardColor === color
                  ? `ring-2 ${ring} ring-offset-2 ring-offset-slate-950 scale-125`
                  : 'opacity-50 hover:opacity-80 hover:scale-110'
              }
            `}
          />
        ))}
      </div>
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onTransfer={handleTransfer}
      />
    </div>
  );
};
