import { render, screen } from '@testing-library/react';
import Transactions from './index';
import type { CardData, Transaction } from 'types';

const mockUseTransactions = vi.fn();

vi.mock('./hooks/useTransactions', () => ({
  useTransactions: () => mockUseTransactions(),
}));

vi.mock('./helpers', () => ({
  formatTransactionDate: () => 'Today',
}));

const currentCard: CardData = {
  pan: '4111111111111111',
  holderName: 'JOHN DOE',
  balance: 1000,
  currency: '$',
  expiry: '12/25',
  cardNetwork: 'visa',
  cardColor: 'violet',
};

const makeTx = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: '1',
  pan: '4111111111111111',
  type: 'debit',
  description: 'Test purchase',
  category: 'pan',
  amount: 50,
  currency: '$',
  date: '2024-06-15T10:00:00',
  status: 'paid',
  ...overrides,
});

describe('Transactions', () => {
  beforeEach(() => {
    mockUseTransactions.mockReturnValue([]);
  });

  it('renders the "Recent Transactions" header', () => {
    render(<Transactions currentCard={currentCard} />);
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
  });

  it('shows the empty state when there are no transactions', () => {
    render(<Transactions currentCard={currentCard} />);
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
  });

  it('hides the empty state when transactions are present', () => {
    mockUseTransactions.mockReturnValue([makeTx()]);
    render(<Transactions currentCard={currentCard} />);
    expect(screen.queryByText('No transactions yet')).not.toBeInTheDocument();
  });

  it('renders one list item per transaction', () => {
    mockUseTransactions.mockReturnValue([
      makeTx({ id: '1', description: 'Spotify' }),
      makeTx({ id: '2', description: 'Amazon' }),
      makeTx({ id: '3', description: 'Netflix' }),
    ]);
    render(<Transactions currentCard={currentCard} />);
    expect(screen.getByText('Spotify')).toBeInTheDocument();
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('shows a + sign for credit (income) transactions', () => {
    mockUseTransactions.mockReturnValue([
      makeTx({ type: 'credit', amount: 200, currency: '$' }),
    ]);
    const { container } = render(<Transactions currentCard={currentCard} />);
    expect(container.textContent).toContain('+');
  });

  it('shows a - sign for debit (expense) transactions', () => {
    mockUseTransactions.mockReturnValue([
      makeTx({ type: 'debit', amount: 200, currency: '$' }),
    ]);
    const { container } = render(<Transactions currentCard={currentCard} />);
    expect(container.textContent).toContain('-');
  });
});
