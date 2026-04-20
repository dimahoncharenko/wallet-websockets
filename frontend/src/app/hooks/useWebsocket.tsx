import { createContext, useContext, useState, useRef } from 'react';
import { useAuth } from '@hooks/useAuth';

type Context = {
  socket: WebSocket | null;
  connect: () => void;
  disconnect: () => void;
};

const context = createContext<Context | undefined>(undefined);

export const useWebsocket = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error('useWebsocket must be used within a WebsocketProvider');
  }
  return contextValue;
};

export const WebsocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { logout, username } = useAuth();

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleTokenRefresh = (ws: WebSocket, expiresIn: number) => {
    if (refreshTimeoutRef.current) {
      console.log('Clearing previous refresh timeout');
      clearTimeout(refreshTimeoutRef.current);
    }

    // Refresh 5 seconds before it expires!
    const refreshAt = Math.max(expiresIn - 5000, 1000); // Wait at least 1 second

    console.log(`Scheduling token refresh in ${refreshAt}ms`);

    refreshTimeoutRef.current = setTimeout(() => {
      console.log('Sending in-band token refresh...');
      ws.send(JSON.stringify({ event: 'token_refresh', token: username }));
    }, refreshAt);
  };

  const connect = () => {
    if (socket || !username) return;
    const ws = new WebSocket('ws://localhost:3000');
    setSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ event: 'auth', token: username }));
    };

    ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.event === 'auth_result' && msg.success) {
          console.log('Initial Auth verification succeeded!');
          scheduleTokenRefresh(ws, msg.expiresIn);

          // Initial ping to bootstrap the layout
          ws.send(JSON.stringify({ event: 'ping' }));
        }

        if (msg.event === 'token_refreshed' && msg.success) {
          console.log('Token aggressively refreshed! Connection alive.');
          scheduleTokenRefresh(ws, msg.expiresIn);
        }
      } catch (error) {
        console.error('Failed to parse WS message:', error);
      }
    });

    ws.onclose = (event) => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);

      // 4001: Token Expired / Unauthorized
      if (event.code === 4001 || event.code === 1008) {
        console.warn('WebSocket closed due to auth expiration:', event.reason);
        logout();
      }
      setSocket(null);
    };
  };

  const disconnect = () => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    socket?.close();
    setSocket(null);
  };

  return (
    <context.Provider value={{ socket, connect, disconnect }}>
      {children}
    </context.Provider>
  );
};
