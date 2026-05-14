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
      <h2
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: colors.textPrimary,
          margin: 0,
        }}
      >
        Recent Transactions
      </h2>
      <button
        type="button"
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(167,139,250,0.8)',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
      >
        <span aria-hidden>→ </span>See all
      </button>
    </div>
  );
};
