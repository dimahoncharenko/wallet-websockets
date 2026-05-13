import { useWebsocket } from '@hooks/useWebsocket';
import { useNotifications } from '@hooks/useNotifications';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { WebsocketMessage } from 'types';
import {
  setCards,
  addCard,
  updateCardBalance,
  setIncome,
  setSpending,
} from '@modules/wallet/store';
import type { RootState, AppDispatch } from '../store';

export const useInitCard = () => {
  const { socket } = useWebsocket();
  const { addNotification } = useNotifications();
  const dispatch = useDispatch<AppDispatch>();

  const currentCardPan = useSelector((state: RootState) => {
    const { cards, activeCardIndex } = state.wallet;
    return cards.length > 0
      ? ((cards[activeCardIndex] ?? cards[0])?.pan ?? null)
      : null;
  });
  const currentCardPanRef = useRef(currentCardPan);
  useEffect(() => {
    currentCardPanRef.current = currentCardPan;
  }, [currentCardPan]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg: WebsocketMessage = JSON.parse(event.data);

        switch (msg.event) {
          case 'init-cards':
            dispatch(setCards(msg.cards));
            break;
          case 'card-added':
            dispatch(addCard(msg.card));
            break;
          case 'change-balance':
            if (Number.isFinite(Number(msg.balance))) {
              dispatch(
                updateCardBalance({
                  pan: msg.creditPan,
                  delta: Number(msg.balance),
                }),
              );
            }
            break;
          case 'update-stats':
            if (msg.pan === currentCardPanRef.current) {
              dispatch(setIncome(msg.income));
              dispatch(setSpending(msg.spending));
            }
            break;
        }
      } catch (error) {
        console.error('Failed to parse WS message:', error);
        toast.error('A real-time update could not be processed.');
        addNotification(
          'security',
          'Connection issue',
          'A real-time update could not be processed.',
        );
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, addNotification, dispatch]);
};
