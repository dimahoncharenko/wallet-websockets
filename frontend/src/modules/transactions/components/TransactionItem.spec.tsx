import { render, screen } from '@testing-library/react';
import { TransactionItem } from './TransactionItem';
import type { Transaction } from 'types';

vi.mock('../helpers', () => ({
  formatTransactionDate: () => 'Today',
}));

const baseTx: Transaction = {
  id: '1',
  pan: '4111111111111111',
  type: 'debit',
  description: 'Netflix Subscription',
  category: 'pan',
  amount: 15.99,
  currency: '$',
  status: 'paid',
  date: '2024-06-15T10:00:00',
};

describe('TransactionItem', () => {
  describe('metadata display', () => {
    it('renders the transaction description', () => {
      render(<TransactionItem isIncome={false} transaction={baseTx} />);
      expect(screen.getByText('Netflix Subscription')).toBeInTheDocument();
    });

    it('renders the category name', () => {
      render(<TransactionItem isIncome={false} transaction={baseTx} />);
      expect(screen.getByText(/pan/i)).toBeInTheDocument();
    });

    it('renders the date string returned by formatTransactionDate', () => {
      render(<TransactionItem isIncome={false} transaction={baseTx} />);
      expect(screen.getByText(/Today/)).toBeInTheDocument();
    });
  });

  describe('income vs expense', () => {
    it('prefixes the amount with + for income', () => {
      const { container } = render(
        <TransactionItem isIncome={true} transaction={baseTx} />,
      );
      expect(container.textContent).toContain('+');
    });

    it('prefixes the amount with - for expenses', () => {
      const { container } = render(
        <TransactionItem isIncome={false} transaction={baseTx} />,
      );
      expect(container.textContent).toContain('-');
    });

    it('includes the numeric amount in the rendered output', () => {
      const { container } = render(
        <TransactionItem isIncome={false} transaction={baseTx} />,
      );
      expect(container.textContent).toContain('15.99');
    });

    it('includes the currency symbol', () => {
      const { container } = render(
        <TransactionItem
          isIncome={false}
          transaction={{ ...baseTx, currency: '€' }}
        />,
      );
      expect(container.textContent).toContain('€');
    });
  });

  describe('category emoji', () => {
    it('shows the fallback 💳 emoji for the "pan" category', () => {
      render(<TransactionItem isIncome={false} transaction={baseTx} />);
      expect(screen.getByText('💳')).toBeInTheDocument();
    });
  });
});
