import { useState } from 'react';
import { colors, fontSize, fontWeight, letterSpacing, radius, transition } from '@lib/theme';
import { useAuth } from '@hooks/useAuth';
import { EyeOpenIcon } from './EyeOpenIcon';
import { CheckIcon } from './CheckIcon';
import { CopyIcon } from './CopyIcon';
import { EyeClosedIcon } from './EyeClosedIcon';
import { VisaIcon } from './VisaIcon';
import { MastercardIcon } from './MastercardIcon';
import { useAnimatedBalance } from '../hooks/useAnimatedBalance';
import { useWalletCards } from '@hooks/useWalletCards';
import { CardData } from 'types';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Props = {
  card?: CardData;
};

export function WalletCard({ card }: Props) {
  const { currentCard, cardTheme } = useWalletCards();
  const { username } = useAuth();
  const [showBalance, setShowBalance] = useState(false);
  const [showPan, setShowPan] = useState(false);
  const [copied, setCopied] = useState(false);

  const renderCard = card || currentCard;

  const theme = cardTheme;
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
    <div
      role="region"
      aria-label={`Card ending in ${groups[groups.length - 1] ?? '****'}`}
      style={{
        borderRadius: radius.card,
        background: `linear-gradient(140deg, ${theme.a} 0%, ${theme.b} 48%, ${theme.c} 100%)`,
        padding: '24px 26px 22px',
        minHeight: 200,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 8px 32px ${colors.shadowDark}`,
        userSelect: 'none',
        transition: `box-shadow ${transition.slow} ease`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius.card,
          background:
            'radial-gradient(ellipse at 28% 16%, rgba(255,255,255,0.2) 0%, transparent 52%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '-200%',
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: prefersReducedMotion ? undefined : 'shimmer 3.5s linear infinite',
          pointerEvents: 'none',
          borderRadius: radius.card,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -55,
          right: -35,
          width: 190,
          height: 190,
          borderRadius: radius.full,
          background: colors.shadowLight,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: radius.full,
                background: 'rgba(255,255,255,0.85)',
              }}
            />
            <span
              style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.bold,
                color: 'rgba(255,255,255,0.75)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              My Wallet
            </span>
          </div>
          <div
            aria-hidden="true"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 7px)',
              gap: 3.5,
            }}
          >
            {Array(9)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 2,
                    background: 'rgba(255,200,50,0.88)',
                  }}
                />
              ))}
          </div>
        </div>

        {/* Balance */}
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
              {showBalance ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </button>
          </div>
          <p
            aria-live="polite"
            aria-label={
              showBalance
                ? `Balance: ${renderCard.currency}${formattedBalance}`
                : 'Balance hidden'
            }
            style={{
              fontSize: fontSize['5xl'],
              fontWeight: fontWeight.extrabold,
              color: colors.textPrimary,
              letterSpacing: letterSpacing.tighter,
              lineHeight: 1,
            }}
          >
            {showBalance ? (
              `${renderCard.currency}${formattedBalance}`
            ) : (
              <span style={{ letterSpacing: '0.2em', fontSize: 20 }}>
                ••••••
              </span>
            )}
          </p>
        </div>

        {/* PAN */}
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
            style={{
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label={showPan ? 'Mask card number' : 'Reveal card number'}
          >
            {showPan ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </button>
          <button
            onClick={handleCopy}
            style={{
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label={copied ? 'Copied!' : 'Copy card number'}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div
                style={{
                  fontSize: fontSize.xxs,
                  fontWeight: fontWeight.semibold,
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 3,
                }}
              >
                Holder
              </div>
              <div style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
                {username || renderCard.holderName}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: fontSize.xxs,
                  fontWeight: fontWeight.semibold,
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 3,
                }}
              >
                Expires
              </div>
              <div style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
                {renderCard.expiry}
              </div>
            </div>
          </div>
          {renderCard.cardNetwork === 'visa' ? (
            <VisaIcon />
          ) : (
            <MastercardIcon />
          )}
        </div>
      </div>
    </div>
  );
}
