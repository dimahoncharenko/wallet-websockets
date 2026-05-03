import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { supabase } from '@lib/supabase';

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
  const socketRef = useRef<WebSocket | null>(null);
  const { logout, session, username } = useAuth();

  const connect = () => {
    if (socketRef.current || !session) return;
    const ws = new WebSocket('ws://localhost:3000');
    socketRef.current = ws;
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ event: 'auth', token: session.access_token }));
    };

    ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.event === 'auth_result' && msg.success) {
          ws.send(JSON.stringify({ event: 'ping', holderName: username }));
        }
      } catch (error) {
        console.error('Failed to parse WS message:', error);
      }
    });

    ws.onclose = (event) => {
      socketRef.current = null;
      setSocket(null);

      if (event.code === 4001 || event.code === 1008) {
        console.warn('WebSocket closed due to auth expiration:', event.reason);
        logout();
      }
    };
  };

  const disconnect = () => {
    socketRef.current?.close();
    socketRef.current = null;
    setSocket(null);
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [session]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (
        event === 'TOKEN_REFRESHED' &&
        newSession &&
        socketRef.current?.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(
          JSON.stringify({
            event: 'token_refresh',
            token: newSession.access_token,
          }),
        );
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <context.Provider value={{ socket, connect, disconnect }}>
      {children}
    </context.Provider>
  );
};
