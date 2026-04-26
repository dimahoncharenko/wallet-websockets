import { Dispatch, SetStateAction, useState } from 'react';
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

type ActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'primary';
};

function ActionButton({ icon, label, onClick, variant = 'default' }: ActionButtonProps) {
  const base = 'flex flex-col items-center gap-2 group';
  const circlePrimary = 'w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:bg-emerald-400 transition-colors';
  const circleDefault = 'w-12 h-12 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-white/70 group-hover:bg-white/[0.12] transition-colors';

  return (
    <button className={base} onClick={onClick}>
      <span className={variant === 'primary' ? circlePrimary : circleDefault}>
        {icon}
      </span>
      <span className="text-[11px] font-medium text-white/50 group-hover:text-white/80 transition-colors">
        {label}
      </span>
    </button>
  );
}

export const CardControls = ({ card, balance, setBalance }: Props) => {
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const { cardColor, changeCardColor } = useCardColor(card.pan);
  const { socket } = useWebsocket();

  const handleTransfer = (pan: string, amount: number) => {
    if (socket && socket.readyState === WebSocket.OPEN && balance - amount >= 0) {
      socket.send(JSON.stringify({ event: 'proceed-transfer', amount, debitPan: card.pan, creditPan: pan }));
      setBalance((prev) => Math.max(0, prev - amount));
    }
  };

  const colorPicker = (
    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-full border border-white/5">
      {COLOR_OPTIONS.map(({ color, bg, ring }) => (
        <button
          key={color}
          onClick={() => changeCardColor(card.pan, color)}
          aria-label={`Switch to ${color} card`}
          className={`
            w-6 h-6 rounded-full transition-all duration-200
            ${bg}
            ${cardColor === color
              ? `ring-2 ${ring} ring-offset-2 ring-offset-slate-950 scale-125`
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
          className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 transition-transform group-hover:scale-110" />
          <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </span>
          <span className="relative">Transfer</span>
        </button>
        {colorPicker}
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex items-center justify-between w-full pt-2">
        <div className="flex items-center gap-6">
          <ActionButton
            variant="primary"
            label="Send"
            onClick={() => setIsTransferOpen(true)}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            }
          />
          <ActionButton
            label="Receive"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
              </svg>
            }
          />
          <ActionButton
            label="Top Up"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          />
          <ActionButton
            label="More"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" />
              </svg>
            }
          />
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
