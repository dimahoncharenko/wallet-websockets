import { useDispatch } from 'react-redux';
import { updateCardBalance } from '@modules/wallet/store';
import { useWebsocket } from './useWebsocket';
import type { AppDispatch } from '../modules/main/store';

export const useRootActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useWebsocket();

  return {
    updateBalance: (pan: string, delta: number) =>
      dispatch(updateCardBalance({ pan, delta })),
    sendAddCard: () => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ event: 'add-card' }));
      }
    },
  };
};
