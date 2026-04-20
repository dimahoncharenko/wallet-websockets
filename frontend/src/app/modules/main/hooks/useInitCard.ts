import { useWebsocket } from '@hooks/useWebsocket';
import { useEffect, useRef, useState } from 'react';
import { CardData, WebsocketMessage } from 'types';

export const useInitCard = () => {
  const [card, setCard] = useState<CardData | null>(null);
  const panRef = useRef<string | undefined>(undefined);
  const [balance, setBalance] = useState<number>(0);
  const { socket } = useWebsocket();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message: WebsocketMessage = JSON.parse(event.data);
        if (message.event === 'init-card') {
          setCard(message.card);
          panRef.current = message.card.pan;
          setBalance(message.card.balance);
        } else if (message.event === 'change-balance') {
          setBalance((prev) => prev + Number(message.balance));
        }
      } catch (error) {
        console.error('Failed to parse WS message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket]);

  return { card, balance, setBalance };
};
