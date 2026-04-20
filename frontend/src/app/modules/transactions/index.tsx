import { useEffect, useState } from 'react';
import { Transaction, WebsocketMessage } from 'types';
import { useWebsocket } from '@hooks/useWebsocket';

const formatTxDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  
  const dateStr = date.toDateString();
  
  if (dateStr === today.toDateString()) return 'Today';
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toDateString()) return 'Yesterday';
  
  const diffTime = today.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }
  
  return date.toLocaleDateString();
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { socket } = useWebsocket();

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
    <div className="w-full max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold tracking-wide">Recent</h2>
        {transactions.length > 5 && (
          <button className="text-xs text-white/40 hover:text-white/70 transition-colors">
            See all →
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {transactions.map((tx, i) => {
          const isIncome = tx.type === 'credit';

          return (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/5 border border-white/[0.07] rounded-2xl px-4 py-3 hover:bg-white/[0.08] transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-base flex-shrink-0">
                {isIncome ? '↑' : '↓'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate">
                  {tx.description}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  {tx.category}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className={`text-[13px] font-bold ${isIncome ? 'text-emerald-400' : 'text-white'}`}
                >
                  {isIncome ? '+' : '-'}
                  {tx.amount}
                  {tx.currency}
                </p>
                <p className="text-[10px] text-white/30">
                  {formatTxDate(tx.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
