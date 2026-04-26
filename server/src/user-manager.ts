import { WebSocket } from 'ws';
import { CardData, WebsocketMessage } from 'types';

import { StatData } from 'types';

export class UserManager {
  private users = new Set<WebSocket>();
  private panMap = new Map<string, WebSocket>();
  private statsMap = new Map<string, { income: StatData; spending: StatData }>();

  addUser(socket: WebSocket) {
    this.users.add(socket);
  }

  removeUser(socket: WebSocket) {
    this.users.delete(socket);
    for (const [pan, ws] of this.panMap.entries()) {
      if (ws === socket) {
        this.panMap.delete(pan);
        // keep stats for simplicity or clear them
      }
    }
  }

  send(socket: WebSocket, message: WebsocketMessage) {
    socket.send(JSON.stringify(message));
  }

  sendAll(message: WebsocketMessage) {
    this.users.forEach((user) => {
      if (user.readyState === WebSocket.OPEN) {
        this.send(user, message);
      }
    });
  }

  setPan(socket: WebSocket, pan: string) {
    this.panMap.set(pan, socket);
    if (!this.statsMap.has(pan)) {
      this.statsMap.set(pan, {
        income: { value: 0, sparkline: [0] },
        spending: { value: 0, sparkline: [0] },
      });
    }
  }

  getStats(pan: string) {
    if (!this.statsMap.has(pan)) {
      this.statsMap.set(pan, {
        income: { value: 0, sparkline: [0] },
        spending: { value: 0, sparkline: [0] },
      });
    }
    return this.statsMap.get(pan)!;
  }

  updateStats(pan: string, type: 'income' | 'spending', amount: number) {
    const stats = this.getStats(pan);
    stats[type].value += amount;
    stats[type].sparkline.push(stats[type].value);
    if (stats[type].sparkline.length > 20) {
      stats[type].sparkline.shift();
    }
  }

  sendByPan(pan: string, message: WebsocketMessage) {
    const socket = this.panMap.get(pan);
    if (socket && socket.readyState === WebSocket.OPEN) {
      this.send(socket, message);
    }
  }

  getAllUsers() {
    return this.users;
  }

  static makeCard() {
    const CARD: CardData = {
      holderName: 'Jane Doe',
      pan: `4567${makePan()}`,
      balance: Math.round(Math.random() * 10000) + 100,
      currency: '$',
      expiry: '12/27',
      cardNetwork: 'visa',
    };

    return CARD;
  }
}


const makePan = () => {
  return String(Math.round(Math.random() * 688888888868) + 111111111111).padEnd(
    12,
    '0',
  );
};
