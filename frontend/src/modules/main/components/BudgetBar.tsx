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
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
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
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
          Monthly Budget
        </span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>
          <span style={{ color: dot, transition: 'color 0.6s' }}>
            ${spending.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>
            {' '}
            / ${budget.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: 'rgba(255,255,255,0.07)',
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
            transition: 'width 1s ease, background 0.6s',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.28)',
            fontWeight: 500,
          }}
        >
          {pct}% used this month
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.28)',
            fontWeight: 500,
          }}
        >
          ${remaining.toLocaleString('en-US', { minimumFractionDigits: 0 })}{' '}
          remaining
        </span>
      </div>
    </div>
  );
};
