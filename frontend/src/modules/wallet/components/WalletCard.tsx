import { Dispatch, MouseEvent, SetStateAction, useState } from 'react';
import {
  colors,
  fontSize,
  fontWeight,
  letterSpacing,
} from '@lib/theme';
import { useAuth } from '@hooks/useAuth';
import { SvgCheck, SvgCopy, SvgEyeClosed, SvgEyeOpen } from '@components/Icons';
import { useAnimatedBalance } from '../hooks/useAnimatedBalance';
import { useWalletCards } from '@hooks/useWalletCards';
import { CARD_THEMES } from '../const';
import { CardData } from 'types';
import { BaseCard, CardTopRow, CardMetaRow } from './BaseCard';

type Props = {
  card?: CardData;
};

export function WalletCard({ card }: Props) {
  const { currentCard, colors: cardColors } = useWalletCards();
  const { username } = useAuth();
  const [showBalance, setShowBalance] = useState(false);
  const [showPan, setShowPan] = useState(false);
  const [copied, setCopied] = useState(false);

  const renderCard = card || currentCard;

  const activeColor = renderCard
    ? (cardColors[renderCard.pan] ?? renderCard.cardColor ?? 'violet')
    : 'violet';
  const theme = CARD_THEMES[activeColor];
  const animatedBalance = useAnimatedBalance(renderCard?.balance);

  const raw = renderCard?.pan.replace(/\s/g, '') ?? '';
  const groups = (raw.match(/.{1,4}/g) ?? []) as string[];
  const displayGroups = groups.map((g, i) =>
    !showPan && i < groups.length - 1 ? '••••' : g,
  );

  const formattedBalance = animatedBalance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(raw).catch(() => {
      // ignore
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!renderCard) return;

  return (
    <BaseCard theme={theme}>
      <CardTopRow label="My Wallet" />
      <CardBalance
        setShowBalance={setShowBalance}
        showBalance={showBalance}
        card={renderCard}
        balance={formattedBalance}
      />
      <CardPan
        displayGroups={displayGroups}
        handleCopy={handleCopy}
        copied={copied}
        setShowPan={setShowPan}
        showPan={showPan}
      />
      <CardMetaRow
        holderName={username || renderCard.holderName}
        expiry={renderCard.expiry}
        cardNetwork={renderCard.cardNetwork}
      />
    </BaseCard>
  );
}

const CardPan = ({
  copied,
  handleCopy,
  displayGroups,
  setShowPan,
  showPan,
}: {
  displayGroups: string[];
  setShowPan: Dispatch<SetStateAction<boolean>>;
  showPan: boolean;
  handleCopy: (e: MouseEvent) => void;
  copied: boolean;
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontSize: fontSize.base,
          color: 'rgba(255,255,255,0.75)',
          letterSpacing: '0.22em',
          fontVariantNumeric: 'tabular-nums',
          flex: 1,
        }}
      >
        {displayGroups.join('  ')}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowPan((v) => !v);
        }}
        aria-label={showPan ? 'Mask card number' : 'Reveal card number'}
        style={{
          color: 'rgba(255,255,255,0.5)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
        }}
        title={showPan ? 'Mask card number' : 'Reveal card number'}
      >
        {showPan ? <SvgEyeOpen /> : <SvgEyeClosed />}
      </button>
      <button
        onClick={handleCopy}
        aria-label="Copy card number"
        style={{
          color: 'rgba(255,255,255,0.5)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
        }}
        title="Copy card number"
      >
        {copied ? <SvgCheck /> : <SvgCopy />}
      </button>
    </div>
  );
};

const CardBalance = ({
  setShowBalance,
  showBalance,
  balance,
  card,
}: {
  card: CardData;
  showBalance: boolean;
  balance: string;
  setShowBalance: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: fontSize.xs,
            fontWeight: fontWeight.semibold,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Balance
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowBalance((v) => !v);
          }}
          style={{
            color: 'rgba(255,255,255,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label={showBalance ? 'Hide balance' : 'Show balance'}
        >
          {showBalance ? <SvgEyeOpen /> : <SvgEyeClosed />}
        </button>
      </div>
      <p
        style={{
          fontSize: fontSize['5xl'],
          fontWeight: fontWeight.extrabold,
          color: colors.textPrimary,
          letterSpacing: letterSpacing.tighter,
          lineHeight: 1,
        }}
      >
        {showBalance ? (
          `${card.currency}${balance}`
        ) : (
          <span style={{ letterSpacing: '0.2em', fontSize: 20 }}>••••••</span>
        )}
      </p>
    </div>
  );
};
