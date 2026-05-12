import {
  colors,
  fontSize,
  fontWeight,
  letterSpacing,
  radius,
  transition,
} from '@lib/theme';
import type { CardNetwork } from 'types';
import type { CardTheme } from '../const';
import { VisaIcon } from './VisaIcon';
import { MastercardIcon } from './MastercardIcon';

export const BaseCard = ({
  theme,
  children,
  style,
}: {
  theme: CardTheme;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      borderRadius: radius.card,
      background: `linear-gradient(140deg, ${theme.a} 0%, ${theme.b} 48%, ${theme.c} 100%)`,
      padding: '24px 26px 22px',
      minHeight: 200,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 8px 32px ${colors.shadowDark}`,
      userSelect: 'none',
      transition: `background ${transition.slow}`,
      ...style,
    }}
  >
    {/* Radial light */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: radius.card,
        background:
          'radial-gradient(ellipse at 28% 16%, rgba(255,255,255,0.2) 0%, transparent 52%)',
        pointerEvents: 'none',
      }}
    />
    {/* Shimmer */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '-200%',
        right: 0,
        bottom: 0,
        background:
          'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 3.5s linear infinite',
        pointerEvents: 'none',
        borderRadius: radius.card,
      }}
    />
    {/* Decorative circle */}
    <div
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
      {children}
    </div>
  </div>
);

const NfcChip = () => (
  <div
    style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 7px)', gap: 3.5 }}
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
);

export const CardTopRow = ({ label }: { label: string }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div
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
          letterSpacing: letterSpacing.cardLabel,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
    <NfcChip />
  </div>
);

const MetaField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div
      style={{
        fontSize: fontSize.xxs,
        fontWeight: fontWeight.semibold,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: letterSpacing.metaLabel,
        textTransform: 'uppercase',
        marginBottom: 3,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: fontSize.base,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
      }}
    >
      {value}
    </div>
  </div>
);

export const CardMetaRow = ({
  holderName,
  expiry,
  cardNetwork,
}: {
  holderName: string;
  expiry: string;
  cardNetwork: CardNetwork;
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    }}
  >
    <div style={{ display: 'flex', gap: 24 }}>
      <MetaField label="Holder" value={holderName} />
      <MetaField label="Expires" value={expiry} />
    </div>
    {cardNetwork === 'visa' ? <VisaIcon /> : <MastercardIcon />}
  </div>
);
