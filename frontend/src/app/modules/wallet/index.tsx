import { useState } from 'react';
import { EyeOpenIcon } from './components/EyeOpenIcon';
import { ChipIcon } from './components/ChipIcon';
import { CheckIcon } from './components/CheckIcon';
import { CopyIcon } from './components/CopyIcon';
import { EyeClosedIcon } from './components/EyeClosedIcon';
import { VisaIcon } from './components/VisaIcon';
import { MastercardIcon } from './components/MastercardIcon';
import { WalletCardProps } from 'types';
import { GRADIENTS } from './const';
import { useCardColor } from '@hooks/useCardColor';
import { useAnimatedBalance } from '@hooks/useAnimatedBalance';
import { useAuth } from '@hooks/useAuth';

export default function WalletCard({ card }: WalletCardProps) {
  const { username } = useAuth();

  const [showBalance, setShowBalance] = useState(false);
  const [showPan, setShowPan] = useState(false);
  const [copied, setCopied] = useState(false);

  const { cardColor } = useCardColor();
  const color = cardColor ?? 'violet';
  const gradient = GRADIENTS[color];

  const animatedBalance = useAnimatedBalance(card.balance);

  const raw = card.pan.replace(/\s/g, '');
  const groups = (raw.match(/.{1,4}/g) ?? []) as string[];
  const displayGroups = groups.map((g, i) =>
    !showPan && i < groups.length - 1 ? '••••' : g,
  );

  const formattedBalance = animatedBalance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(raw).catch((_e) => {
      /* ignore */
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`
        relative w-full rounded-2xl overflow-hidden select-none group
        bg-gradient-to-br ${gradient}
        shadow-2xl
        text-white
      `}
      style={{ aspectRatio: '1.586' }}
    >
      <div className="absolute -top-14 -right-14 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-20 -left-14 w-64 h-64 rounded-full bg-white/5  pointer-events-none" />

      <div
        className="
        absolute inset-0 pointer-events-none rounded-2xl
        opacity-0 group-hover:opacity-100
        transition-opacity duration-700
        bg-gradient-to-br from-white/[0.08] via-transparent to-transparent
      "
      />

      <div className="relative h-full flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-300 text-[10px] leading-none">✦</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
              My Wallet
            </span>
          </div>
          <ChipIcon />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-medium">
              Balance
            </span>
            <button
              onClick={() => setShowBalance((v) => !v)}
              className="text-white/50 hover:text-white/90 transition-colors"
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </button>
          </div>
          <p className="font-mono text-[22px] font-bold tracking-wide leading-none">
            {showBalance ? (
              `${card.currency}${formattedBalance}`
            ) : (
              <span className="tracking-[0.25em]">
                •&thinsp;•&thinsp;•&thinsp;•&thinsp;•&thinsp;•
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] tracking-[0.22em] text-white/90 flex-1">
            {displayGroups.join('  ')}
          </span>
          <button
            onClick={() => setShowPan((v) => !v)}
            className="text-white/50 hover:text-white/90 transition-colors flex-shrink-0"
            title={showPan ? 'Mask card number' : 'Reveal card number'}
          >
            {showPan ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </button>
          <button
            onClick={handleCopy}
            className="text-white/50 hover:text-white/90 transition-colors flex-shrink-0"
            title="Copy card number"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-0.5 font-medium">
              Card Holder
            </p>
            <p className="text-[13px] font-semibold tracking-widest">
              {username}
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-0.5 font-medium">
              Expires
            </p>
            <p className="text-[13px] font-semibold tracking-widest">
              {card.expiry}
            </p>
          </div>
          {card.cardNetwork === 'visa' ? <VisaIcon /> : <MastercardIcon />}
        </div>
      </div>
    </div>
  );
}
