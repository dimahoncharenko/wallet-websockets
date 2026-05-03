import { colors } from '@lib/theme';

export const Header = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <span
        style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}
      >
        Recent Transactions
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(167,139,250,0.8)',
          cursor: 'pointer',
        }}
      >
        See all →
      </span>
    </div>
  );
};
