type Props = {
  income: number;
  spending: number;
};

export const useBudget = ({ income, spending }: Props) => {
  const budget = income > 0 ? income : 5000;
  const percentage =
    budget > 0 ? Math.min(Math.round((spending / budget) * 100), 100) : 0;
  const remaining = Math.max(budget - spending, 0);

  return {
    budget,
    remaining,
    percentage,
  };
};
