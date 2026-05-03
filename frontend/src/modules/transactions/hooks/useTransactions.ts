import { useWebsocket } from '@hooks/useWebsocket';
import { useEffect, useState } from 'react';
import { CardData, Transaction, WebsocketMessage } from 'types';

type Props = {
  currentCard: CardData;
};

export const useTransactions = ({ currentCard }: Props) => {
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

  return transactionsToShow;
};
