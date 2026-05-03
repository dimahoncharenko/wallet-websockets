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
      <Header />

      {transactions.length === 0 ? (
        <Empty />
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {transactions.map((tx) => (
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
