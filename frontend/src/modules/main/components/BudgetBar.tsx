import { colors, fontSize, fontWeight, radius, transition } from '@lib/theme';

export const BudgetBar = ({
  income,
  spending,
  dot,
}: {
  income: number;
  spending: number;
  dot: string;
}) => {
  const budget = income > 0 ? income : 5000;
  const pct =
    budget > 0 ? Math.min(Math.round((spending / budget) * 100), 100) : 0;
  const remaining = Math.max(budget - spending, 0);

  return (
    <div
      style={{
        background: colors.surfaceBare,
        border: `1px solid ${colors.borderSubtle}`,
        borderRadius: radius['2xl'],
        padding: '20px 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
          Monthly Budget
        </span>
        <span style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
          <span style={{ color: dot, transition: `color ${transition.slow}` }}>
            ${spending.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
          <span style={{ color: colors.textMuted, fontWeight: fontWeight.regular }}>
            {' '}
            / ${budget.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: colors.borderSubtle,
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 4,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${dot}88, ${dot})`,
            transition: `width 1s ease, background ${transition.slow}`,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: fontSize.md,
            color: colors.textSubtle,
            fontWeight: fontWeight.medium,
          }}
        >
          {pct}% used this month
        </span>
        <span
          style={{
            fontSize: fontSize.md,
            color: colors.textSubtle,
            fontWeight: fontWeight.medium,
          }}
        >
          ${remaining.toLocaleString('en-US', { minimumFractionDigits: 0 })}{' '}
          remaining
        </span>
      </div>
    </div>
  );
};
