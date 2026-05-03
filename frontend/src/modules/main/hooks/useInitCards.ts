import { useWalletCards } from '@hooks/useWalletCards';
import { useWebsocket } from '@hooks/useWebsocket';
import { useNotifications } from '@hooks/useNotifications';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { WebsocketMessage } from 'types';

export const useInitCard = () => {
  const { setCards } = useWalletCards();
  const { socket } = useWebsocket();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg: WebsocketMessage = JSON.parse(event.data);
        if (msg.event === 'init-cards') {
          setCards(msg.cards);
        } else if (msg.event === 'card-added') {
          setCards((prev) => [...prev, msg.card]);
        } else if (msg.event === 'change-balance') {
          setCards((prev) =>
            prev.map((c) =>
              c.pan === msg.creditPan
                ? { ...c, balance: c.balance + Number(msg.balance) }
                : c,
            ),
          );
        }
      } catch (error) {
        console.error('Failed to parse WS message:', error);
        toast.error('A real-time update could not be processed.');
        addNotification('security', 'Connection issue', 'A real-time update could not be processed.');
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, setCards, addNotification]);

  const updateBalance = (pan: string, delta: number) =>
    setCards((prev) =>
      prev.map((c) =>
        c.pan === pan ? { ...c, balance: c.balance + delta } : c,
      ),
    );

  const sendAddCard = () => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event: 'add-card' }));
    }
  };

  return { updateBalance, sendAddCard };
};
