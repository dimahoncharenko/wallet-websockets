import { useState } from 'react';
import { COLOR_OPTIONS } from '../const';
import { TransferModal } from '@modules/transfers/components/TransferModal';
import { useWebsocket } from '@hooks/useWebsocket';
import { CardData } from 'types';
import { useRootActions } from '@hooks/useRootActions';
import { useWalletCards } from '@hooks/useWalletCards';

type Props = {
  card: CardData;
  balance: number;
};

export const CardControls = ({ card, balance }: Props) => {
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const { currentCard, setColor, cardTheme } = useWalletCards();
  const { updateBalance } = useRootActions();
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
      updateBalance(card.pan, -amount);
    }
  };

  const actions = [
    {
      label: 'Send',
      accent: true,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      ),
      onClick: () => setIsTransferOpen(true),
    },
    {
      label: 'Receive',
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      ),
    },
    {
      label: 'Top Up',
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
    {
      label: 'More',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      ),
    },
  ];

  const colorPicker = (
    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-full border border-white/5">
      {COLOR_OPTIONS.map(({ color, bg, ring }) => (
        <button
          key={color}
          onClick={() => setColor(card.pan, color)}
          aria-label={`Switch to ${color} card`}
          className={`
            w-6 h-6 rounded-full transition-all duration-200
            ${bg}
            ${
              currentCard?.cardColor === color
                ? `ring-2 ${ring} ring-offset-2 ring-offset-[#08080f] scale-125`
                : 'opacity-50 hover:opacity-80 hover:scale-110'
            }
          `}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile layout */}
      <div className="flex items-center justify-between w-full max-w-sm lg:hidden">
        <button
          onClick={() => setIsTransferOpen(true)}
          className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white overflow-hidden transition-all hover:scale-105 active:scale-95"
          style={{ boxShadow: `0 8px 24px ${cardTheme.glow}` }}
        >
          <div
            className="absolute inset-0 transition-transform group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${cardTheme.a}cc, ${cardTheme.b})`,
            }}
          />
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
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </span>
          <span className="relative">Transfer</span>
        </button>
        {colorPicker}
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex items-center justify-between w-full pt-2">
        <div className="flex items-center gap-5">
          {actions.map((a) => (
            <div
              key={a.label}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              onClick={a.onClick}
            >
              <div
                className="w-12 h-12 rounded-[15px] flex items-center justify-center transition-all"
                style={
                  a.accent
                    ? {
                        background: `linear-gradient(135deg, ${cardTheme.dot}cc, ${cardTheme.dot}88)`,
                        boxShadow: `0 8px 20px ${cardTheme.glow}`,
                        color: '#fff',
                      }
                    : {
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.6)',
                      }
                }
              >
                {a.icon}
              </div>
              <span className="text-[11px] font-medium text-white/35 group-hover:text-white/70 transition-colors">
                {a.label}
              </span>
            </div>
          ))}
        </div>
        {colorPicker}
      </div>

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onTransfer={handleTransfer}
      />
    </>
  );
};
