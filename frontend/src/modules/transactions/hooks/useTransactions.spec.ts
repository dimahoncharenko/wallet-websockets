import { renderHook, act } from '@testing-library/react';
import { useTransactions } from './useTransactions';
import type { CardData, Transaction } from 'types';

const mockUseWebsocket = vi.fn();

vi.mock('@hooks/useWebsocket', () => ({
  useWebsocket: () => mockUseWebsocket(),
}));

const makeSocket = () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

type MockSocket = ReturnType<typeof makeSocket>;

const currentCard: CardData = {
  pan: '4111111111111111',
  holderName: 'JOHN DOE',
  balance: 1000,
  currency: '$',
  expiry: '12/25',
  cardNetwork: 'visa',
  cardColor: 'violet',
};

const makeTx = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: '1',
  pan: '4111111111111111',
  type: 'debit',
  description: 'Test purchase',
  category: 'pan',
  amount: 50,
  currency: '$',
  status: 'paid',
  date: '2024-06-15T10:00:00',
  ...overrides,
});

// Retrieves the handler registered with socket.addEventListener('message', ...).
const getMessageHandler = (socket: MockSocket) => {
  const [[, handler]] = socket.addEventListener.mock.calls;
  return handler as (e: { data: string }) => void;
};

// Dispatches a fake WebSocket message event on the given socket mock.
const sendMessage = (socket: MockSocket, payload: unknown) => {
  const handler = getMessageHandler(socket);
  act(() => {
    handler({ data: JSON.stringify(payload) });
  });
};

// ─── tests ──────────────────────────────────────────────────────────────────

describe('useTransactions', () => {
  let socket: MockSocket;

  beforeEach(() => {
    socket = makeSocket();
    mockUseWebsocket.mockReturnValue({ socket });
  });

  it('returns an empty array before any messages arrive', () => {
    const { result } = renderHook(() => useTransactions({ currentCard }));
    expect(result.current).toEqual([]);
  });

  it('returns an empty array when the socket is null', () => {
    mockUseWebsocket.mockReturnValue({ socket: null });
    const { result } = renderHook(() => useTransactions({ currentCard }));
    expect(result.current).toEqual([]);
  });

  it('adds a transaction when an update-history message arrives', () => {
    const { result } = renderHook(() => useTransactions({ currentCard }));
    const tx = makeTx();

    sendMessage(socket, { event: 'update-history', transaction: tx });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toEqual(tx);
  });

  it('accumulates multiple transactions in arrival order', () => {
    const { result } = renderHook(() => useTransactions({ currentCard }));

    sendMessage(socket, {
      event: 'update-history',
      transaction: makeTx({ id: '1', description: 'First' }),
    });
    sendMessage(socket, {
      event: 'update-history',
      transaction: makeTx({ id: '2', description: 'Second' }),
    });

    expect(result.current).toHaveLength(2);
    expect(result.current[0].description).toBe('First');
    expect(result.current[1].description).toBe('Second');
  });

  it('ignores messages whose event type is not update-history', () => {
    const { result } = renderHook(() => useTransactions({ currentCard }));

    sendMessage(socket, { event: 'some-other-event', transaction: makeTx() });

    expect(result.current).toHaveLength(0);
  });

  it('filters out transactions whose pan does not match currentCard.pan', () => {
    const { result } = renderHook(() => useTransactions({ currentCard }));

    sendMessage(socket, {
      event: 'update-history',
      transaction: makeTx({ id: '1', pan: '4111111111111111' }),
    });
    sendMessage(socket, {
      event: 'update-history',
      transaction: makeTx({ id: '2', pan: '5500005555555559' }),
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].pan).toBe('4111111111111111');
  });

  it('removes the message listener when the socket instance changes', () => {
    const { rerender } = renderHook(() => useTransactions({ currentCard }));

    const registeredHandler = getMessageHandler(socket);

    const socket2 = makeSocket();
    mockUseWebsocket.mockReturnValue({ socket: socket2 });
    act(() => {
      rerender();
    });

    expect(socket.removeEventListener).toHaveBeenCalledWith(
      'message',
      registeredHandler,
    );
  });

  it('removes the message listener on unmount', () => {
    const { unmount } = renderHook(() => useTransactions({ currentCard }));

    const registeredHandler = getMessageHandler(socket);
    unmount();

    expect(socket.removeEventListener).toHaveBeenCalledWith(
      'message',
      registeredHandler,
    );
  });
});
