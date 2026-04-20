import express from 'express';
import { RawData, WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { UserManager } from './user-manager';
import { WebsocketMessage } from 'types';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const userManager = new UserManager();

interface AuthWebSocket extends WebSocket {
  authenticated?: boolean;
  username?: string;
  authTimeout?: NodeJS.Timeout;
  sessionTimeout?: NodeJS.Timeout;
}

const SESSION_LIFETIME_MS = 20000;

const VALID_TOKENS = ['Dima', 'Dimas'];

const startSessionTimer = (socket: AuthWebSocket) => {
  if (socket.sessionTimeout) clearTimeout(socket.sessionTimeout);

  socket.sessionTimeout = setTimeout(() => {
    console.log('sessionTimeout is triggered');
    socket.close(4001, 'Token Expired');
  }, SESSION_LIFETIME_MS);
};

wss.on('connection', (socket: AuthWebSocket) => {
  socket.authenticated = false;

  const authTimeout = setTimeout(() => {
    console.log('Auth timeout is triggered!', socket.authenticated);
    if (!socket.authenticated) socket.close(4001, 'Auth timeout');
  }, 5000);

  socket.authTimeout = authTimeout;

  socket.on('message', async (data: RawData) => {
    let payload: WebsocketMessage;
    try {
      payload = JSON.parse(data.toString());
    } catch {
      return;
    }

    if (!socket.authenticated) {
      if (payload.event !== 'auth') {
        console.log('Authenticate first', payload.event);
        socket.close(4001, 'Authenticate first');
        return;
      }

      const token = payload.token;
      if (
        !token ||
        token.trim().length === 0 ||
        !VALID_TOKENS.includes(token)
      ) {
        console.log('Invalid token');
        clearTimeout(authTimeout);
        socket.close(4001, 'Invalid token');
        return;
      }

      socket.authenticated = true;
      socket.username = token;
      clearTimeout(authTimeout);

      console.log('Sending auth_result');
      socket.send(
        JSON.stringify({
          event: 'auth_result',
          success: socket.authenticated,
          expiresIn: SESSION_LIFETIME_MS,
        }),
      );
      userManager.addUser(socket);

      console.log('Starting session timer');
      startSessionTimer(socket);
      return;
    }

    if (payload.event === 'token_refresh') {
      const token = payload.token;
      console.log('Token is about to refresh:', token);
      if (!token || token.trim().length === 0) {
        socket.close(4001, 'Refresh token invalid');
        return;
      }

      socket.username = token;
      startSessionTimer(socket);

      socket.send(
        JSON.stringify({
          event: 'token_refreshed',
          success: true,
          expiresIn: SESSION_LIFETIME_MS,
        }),
      );
      return;
    }

    if (payload.event === 'ping') {
      console.log('Sending init-card');
      const card = UserManager.makeCard();
      userManager.setPan(socket, card.pan);
      userManager.send(socket, {
        event: 'init-card',
        card: card,
      });
    }

    if (payload.event === 'proceed-transfer') {
      const transactionBase = {
        id: Math.random().toString(36).substring(2, 15),
        amount: payload.amount,
        currency: '$',
        category: 'pan' as const,
        date: new Date().toISOString(),
      };

      try {
        await Promise.resolve();

        userManager.sendByPan(payload.creditPan, {
          event: 'change-balance',
          balance: payload.amount.toString(),
          creditPan: payload.creditPan,
          message: `Transfer successful from ${maskPan(payload.debitPan)}`,
        });

        userManager.sendByPan(payload.creditPan, {
          event: 'update-history',
          transaction: {
            ...transactionBase,
            description: `Transfer from ${maskPan(payload.debitPan)}`,
            pan: payload.debitPan,
            type: 'credit',
            status: 'paid',
          },
        });

        userManager.sendByPan(payload.debitPan, {
          event: 'update-history',
          transaction: {
            ...transactionBase,
            description: `Transfer to ${maskPan(payload.creditPan)}`,
            pan: payload.creditPan,
            type: 'debit',
            status: 'paid',
          },
        });
      } catch {
        userManager.sendByPan(payload.debitPan, {
          event: 'change-balance',
          balance: payload.amount.toString(),
          creditPan: payload.debitPan,
          message: `Transfer failed to ${maskPan(payload.creditPan)}`,
        });

        userManager.sendByPan(payload.debitPan, {
          event: 'update-history',
          transaction: {
            ...transactionBase,
            description: `Transfer to ${maskPan(payload.creditPan)} failed`,
            pan: payload.creditPan,
            type: 'debit',
            status: 'failed',
          },
        });
      }
    }
  });

  socket.on('close', () => {
    if (socket.authTimeout) clearTimeout(socket.authTimeout);
    if (socket.sessionTimeout) clearTimeout(socket.sessionTimeout);
    userManager.removeUser(socket);
  });
});

wss.on('listening', () => {
  console.log(`Server listening on port: ${port}`);
});

httpServer.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

function maskPan(pan: string) {
  return `${pan.slice(0, 4)} **** **** ${pan.slice(-4)}`;
}
