import { useDispatch } from 'react-redux';
import { updateCardBalance } from '@modules/wallet/store';
import { useWebsocket } from './useWebsocket';
import type { AppDispatch } from '../modules/main/store';
import type { CardColor, CardNetwork } from 'types';

export type AddCardData = {
  pan: string;
  expiry: string;
  holderName: string;
  cardNetwork: CardNetwork;
  cardColor: CardColor;
};

export const useRootActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useWebsocket();

  return {
    updateBalance: (pan: string, delta: number) =>
      dispatch(updateCardBalance({ pan, delta })),
    sendAddCard: (data: AddCardData) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ event: 'add-card', ...data }));
      }
    },
  };
};
