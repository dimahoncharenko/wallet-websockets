import { CardData } from 'types';
import { TransactionItem } from './components/TransactionItem';
import { Empty } from './components/Empty';
import { Header } from './components/Header';
import { useTransactions } from './hooks/useTransactions';

export default function Transactions({
  currentCard,
}: {
  currentCard: CardData;
}) {
  const transactions = useTransactions({ currentCard });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
<<<<<<< HEAD
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2
          style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, margin: 0 }}
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
          <span aria-hidden="true">→ </span>See all
        </button>
      </div>
=======
      <Header />
>>>>>>> main

      {transactions.length === 0 ? (
        <Empty />
      ) : (
<<<<<<< HEAD
        <div aria-live="polite" aria-label="Transaction list" style={{ flex: 1, overflowY: 'auto' }}>
          {transactionsToShow.map((tx, i) => (
=======
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {transactions.map((tx) => (
>>>>>>> main
            <TransactionItem
              key={tx.id}
              isIncome={tx.type === 'credit'}
              transaction={tx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
