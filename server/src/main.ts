import express from 'express';
import { RawData, WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { createPublicKey } from 'crypto';
import { UserManager } from './user-manager';
import { WebsocketMessage } from 'types';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const userManager = new UserManager();

const jwksCache = new Map<string, string>();

async function loadJWKS(): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
  if (!res.ok) throw new Error(`JWKS fetch failed with status ${res.status}`);

  const body = (await res.json()) as { keys: Array<Record<string, unknown>> };
  jwksCache.clear();

  for (const jwk of body.keys) {
    if (typeof jwk.kid !== 'string') continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pem = createPublicKey({ key: jwk as any, format: 'jwk' }).export({
      type: 'spki',
      format: 'pem',
    }) as string;
    jwksCache.set(jwk.kid, pem);
  }
}

interface AuthWebSocket extends WebSocket {
  authenticated?: boolean;
  userId?: string;
  authTimeout?: NodeJS.Timeout;
  sessionTimeout?: NodeJS.Timeout;
}

const SESSION_LIFETIME_MS = 3_600_000; // 1 hour — matches Supabase JWT lifetime

function verifyToken(token: string): { sub: string; email: string } | null {
  try {
    const header = jwt.decode(token, { complete: true })?.header;
    const kid = header?.kid;
    const alg = header?.alg;

    const cachedKey =
      alg === 'ES256' && typeof kid === 'string'
        ? jwksCache.get(kid)
        : undefined;

    const secret = cachedKey ?? (JWT_SECRET as string);
    const algorithms: jwt.Algorithm[] = cachedKey ? ['ES256'] : ['HS256'];

    return jwt.verify(token, secret, { algorithms }) as {
      sub: string;
      email: string;
    };
  } catch (err) {
    console.error('Error verifying the token: ', err);
    return null;
  }
}

const startSessionTimer = (socket: AuthWebSocket) => {
  if (socket.sessionTimeout) clearTimeout(socket.sessionTimeout);

  socket.sessionTimeout = setTimeout(() => {
    socket.close(4001, 'Token Expired');
  }, SESSION_LIFETIME_MS);
};

wss.on('connection', (socket: AuthWebSocket) => {
  socket.authenticated = false;

  const authTimeout = setTimeout(() => {
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
        socket.close(4001, 'Authenticate first');
        return;
      }

      const user = verifyToken(payload.token);
      if (!user) {
        clearTimeout(authTimeout);
        socket.close(4001, 'Invalid token');
        return;
      }

      socket.authenticated = true;
      socket.userId = user.sub;
      clearTimeout(authTimeout);

      socket.send(
        JSON.stringify({
          event: 'auth_result',
          success: true,
          expiresIn: SESSION_LIFETIME_MS,
        }),
      );
      userManager.addUser(socket);
      startSessionTimer(socket);
      return;
    }

    if (payload.event === 'token_refresh') {
      const user = verifyToken(payload.token);
      if (!user) {
        socket.close(4001, 'Refresh token invalid');
        return;
      }

      socket.userId = user.sub;
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
      const card = UserManager.makeCard();
      userManager.setPan(socket, card.pan);
      userManager.send(socket, { event: 'init-card', card });
      userManager.send(socket, {
        event: 'update-stats',
        pan: card.pan,
        ...userManager.getStats(card.pan),
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
            pan: payload.creditPan,
            type: 'credit',
            status: 'paid',
          },
        });

        userManager.sendByPan(payload.debitPan, {
          event: 'update-history',
          transaction: {
            ...transactionBase,
            description: `Transfer to ${maskPan(payload.creditPan)}`,
            pan: payload.debitPan,
            type: 'debit',
            status: 'paid',
          },
        });

        userManager.updateStats(payload.creditPan, 'income', payload.amount);
        userManager.sendByPan(payload.creditPan, {
          event: 'update-stats',
          pan: payload.creditPan,
          ...userManager.getStats(payload.creditPan),
        });

        userManager.updateStats(payload.debitPan, 'spending', payload.amount);
        userManager.sendByPan(payload.debitPan, {
          event: 'update-stats',
          pan: payload.debitPan,
          ...userManager.getStats(payload.debitPan),
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
            pan: payload.debitPan,
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

loadJWKS()
  .then(() => {
    httpServer.listen(port, host, () => {
      console.log(`[ ready ] http://${host}:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to load JWKS, server will not start:', err);
    process.exit(1);
  });

function maskPan(pan: string) {
  return `${pan.slice(0, 4)} **** **** ${pan.slice(-4)}`;
}
