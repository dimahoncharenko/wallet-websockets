import { useState } from 'react';
import { useOpenTransfers } from '../hooks/useOpenTransfers';
import { TransferForm } from './TransferForm';

export const TransferModal = ({
  isOpen,
  onClose,
  onTransfer,
}: {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (pan: string, amount: number) => void;
}) => {
  const [pan, setPan] = useState('');
  const [amount, setAmount] = useState('');

  const mounted = useOpenTransfers({ isOpen, onClose, setAmount, setPan });

  if (!isOpen && !mounted && !pan && !amount) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen && mounted ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          isOpen && mounted
            ? 'scale-100 translate-y-0'
            : 'scale-95 translate-y-4'
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500" />

        <div className="p-6">
          <h2 className="text-xl font-bold tracking-wide text-white mb-1">
            Transfer Funds
          </h2>
          <p className="text-sm text-white/50 mb-6">
            Send money instantly to any card.
          </p>

          <TransferForm
            setAmount={setAmount}
            setPan={setPan}
            onClose={onClose}
            onTransfer={onTransfer}
            pan={pan}
            amount={amount}
          />
        </div>
      </div>
    </div>
  );
};
