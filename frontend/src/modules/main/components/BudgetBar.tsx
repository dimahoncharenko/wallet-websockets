import { colors, fontSize, fontWeight, radius, transition } from '@lib/theme';
import { useBudget } from '../hooks/useBudget';

export const BudgetBar = ({
  income,
  spending,
  dot,
}: {
  income: number;
  spending: number;
  dot: string;
}) => {
  const { percentage, remaining, budget } = useBudget({ income, spending });

  return (
    <div
      style={{
        background: colors.surfaceBare,
        border: `1px solid ${colors.borderSubtle}`,
        borderRadius: radius['2xl'],
        padding: '20px 24px',
      }}
    >
      <BudgetHeader dot={dot} spending={spending} budget={budget} />
      <ProgressBar percentage={percentage} dot={dot} />
      <BudgetFooter remaining={remaining} percentage={percentage} />
    </div>
  );
};

const BudgetHeader = ({
  dot,
  spending,
  budget,
}: {
  dot: string;
  spending: number;
  budget: number;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}
    >
      <span
        style={{
          fontSize: fontSize.lg,
          fontWeight: fontWeight.bold,
          color: colors.textPrimary,
        }}
      >
        Monthly Budget
      </span>
      <span style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
        <span style={{ color: dot, transition: `color ${transition.slow}` }}>
          ${spending.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </span>
        <span
          style={{ color: colors.textMuted, fontWeight: fontWeight.regular }}
        >
          {' '}
          / ${budget.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </span>
      </span>
    </div>
  );
};

const ProgressBar = ({
  dot,
  percentage,
}: {
  dot: string;
  percentage: number;
}) => {
  return (
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
          width: `${percentage}%`,
          background: `linear-gradient(90deg, ${dot}88, ${dot})`,
          transition: `width 1s ease, background ${transition.slow}`,
        }}
      />
    </div>
  );
};

const BudgetFooter = ({
  percentage,
  remaining,
}: {
  percentage: number;
  remaining: number;
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span
        style={{
          fontSize: fontSize.md,
          color: colors.textSubtle,
          fontWeight: fontWeight.medium,
        }}
      >
        {percentage}% used this month
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
  );
};
