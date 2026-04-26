import { useEffect, useState } from 'react';
import { CardData, Transaction, WebsocketMessage } from 'types';
import { useWebsocket } from '@hooks/useWebsocket';
import { Header } from './components/Header';
import { Empty } from './components/Empty';
import { TransactionItem } from './components/TransactionItem';

export default function Transactions({
  currentCard,
}: {
  currentCard: CardData;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { socket } = useWebsocket();

  const transactionsToShow = transactions.filter(
    (tx) => tx.pan === currentCard.pan,
  );

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (event: MessageEvent) => {
      const message: WebsocketMessage = JSON.parse(event.data);
      if (message.event === 'update-history') {
        setTransactions((prev) => [...prev, message.transaction]);
      }
    };
    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket]);

  const isEmpty = transactionsToShow.length === 0;

  return (
    <div className="w-full lg:p-6 lg:flex lg:flex-col lg:h-full">
      <Header />

      {isEmpty ? (
        <Empty />
      ) : (
        <div className="flex flex-col gap-2 lg:overflow-y-auto lg:flex-1">
          {transactionsToShow.map((tx, i) => {
            const isIncome = tx.type === 'credit';
            return <TransactionItem isIncome={isIncome} transaction={tx} />;
          })}
        </div>
      )}
    </div>
  );
}
