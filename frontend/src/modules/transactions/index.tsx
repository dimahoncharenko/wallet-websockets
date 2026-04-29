import { useEffect, useState } from 'react';
import { CardData, Transaction, WebsocketMessage } from 'types';
import { useWebsocket } from '@hooks/useWebsocket';
import { TransactionItem } from './components/TransactionItem';

export default function Transactions({ currentCard }: { currentCard: CardData }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { socket } = useWebsocket();

  const transactionsToShow = transactions.filter((tx) => tx.pan === currentCard.pan);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Recent Transactions</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(167,139,250,0.8)', cursor: 'pointer' }}>See all →</span>
      </div>

      {transactionsToShow.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '32px 0', opacity: 0.4 }}>
          <div style={{ fontSize: 32 }}>💳</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>No transactions yet</div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {transactionsToShow.map((tx, i) => (
            <TransactionItem key={i} isIncome={tx.type === 'credit'} transaction={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
