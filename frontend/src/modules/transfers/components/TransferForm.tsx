import { SubmitEvent, useState } from 'react';
import { maskPan } from '../helpers';

type Props = {
  onClose: () => void;
  onTransfer: (pan: string, amount: number) => void;
  pan: string;
  amount: string;
  setAmount: (value: string) => void;
  setPan: (value: string) => void;
};

export const TransferForm = ({
  onClose,
  onTransfer,
  setAmount,
  setPan,
  pan,
  amount,
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const sanitizedPan = pan.replace(/\s/g, '');

      onTransfer(sanitizedPan, Number(amount));
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value
      .replace(/\s+/g, '')
      .replace(/[^0-9]/gi, '');

    const maskedPan = maskPan(sanitizedValue);
    maskedPan && setPan(maskedPan);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2 ml-1">
          Recipient Card Number
        </label>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
          <input
            type="text"
            value={pan}
            onChange={handlePanChange}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            required
            className="relative w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all font-semibold"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2 ml-1">
          Amount
        </label>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm font-semibold z-10">
            $
          </span>
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
            className="relative w-full bg-slate-950/50 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all font-semibold"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3.5 px-4 rounded-xl bg-white/5 text-sm text-white hover:bg-white/10 active:bg-white/5 transition-colors border border-white/5 font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || pan.length < 19 || !amount}
          className="flex-1 relative py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 group-hover:scale-105 transition-transform duration-300"></div>
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              'Send Now'
            )}
          </span>
        </button>
      </div>
    </form>
  );
};
