import { renderHook } from '@testing-library/react';
import { useInitCard } from './useInitCards';
import toast from 'react-hot-toast';

const mockSocket = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};
const mockDispatch = vi.fn();
const mockAddNotification = vi.fn();
const mockUseWebsocket = vi.fn();

let currentCardPan: string | null = null;

vi.mock('@hooks/useWebsocket', () => ({
  useWebsocket: () => mockUseWebsocket(),
}));

vi.mock('@hooks/useNotifications', () => ({
  useNotifications: () => ({ addNotification: mockAddNotification }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => currentCardPan,
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn() },
}));

vi.mock('@modules/wallet/store', () => ({
  setCards: (cards: unknown) => ({ type: 'wallet/setCards', payload: cards }),
  addCard: (card: unknown) => ({ type: 'wallet/addCard', payload: card }),
  updateCardBalance: (data: unknown) => ({
    type: 'wallet/updateCardBalance',
    payload: data,
  }),
  setIncome: (income: unknown) => ({
    type: 'wallet/setIncome',
    payload: income,
  }),
  setSpending: (spending: unknown) => ({
    type: 'wallet/setSpending',
    payload: spending,
  }),
}));

const getHandler = () => {
  const call = mockSocket.addEventListener.mock.calls.find(
    ([event]) => event === 'message',
  );
  return call?.[1] as ((e: MessageEvent) => void) | undefined;
};

const sendMessage = (data: object) => {
  getHandler()?.(new MessageEvent('message', { data: JSON.stringify(data) }));
};

describe('useInitCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentCardPan = null;
    mockUseWebsocket.mockReturnValue({ socket: mockSocket });
  });

  describe('listener registration', () => {
    it('attaches a "message" listener when socket is present', () => {
      renderHook(() => useInitCard());
      expect(mockSocket.addEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function),
      );
    });

    it('removes the "message" listener on unmount', () => {
      const { unmount } = renderHook(() => useInitCard());
      const handler = getHandler();
      unmount();
      expect(mockSocket.removeEventListener).toHaveBeenCalledWith(
        'message',
        handler,
      );
    });

    it('does not attach a listener when socket is null', () => {
      mockUseWebsocket.mockReturnValue({ socket: null });
      renderHook(() => useInitCard());
      expect(mockSocket.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('init-cards event', () => {
    it('dispatches setCards with the received cards array', () => {
      renderHook(() => useInitCard());
      const cards = [{ pan: '1234', balance: '100' }];
      sendMessage({ event: 'init-cards', cards });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'wallet/setCards',
        payload: cards,
      });
    });

    it('dispatches setCards even for an empty cards array', () => {
      renderHook(() => useInitCard());
      sendMessage({ event: 'init-cards', cards: [] });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'wallet/setCards',
        payload: [],
      });
    });
  });

  describe('card-added event', () => {
    it('dispatches addCard with the received card', () => {
      renderHook(() => useInitCard());
      const card = { pan: '5678', balance: '200' };
      sendMessage({ event: 'card-added', card });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'wallet/addCard',
        payload: card,
      });
    });
  });

  describe('change-balance event', () => {
    it('dispatches updateCardBalance with pan and numeric delta', () => {
      renderHook(() => useInitCard());
      sendMessage({
        event: 'change-balance',
        creditPan: '1234',
        balance: '50.5',
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'wallet/updateCardBalance',
        payload: { pan: '1234', delta: 50.5 },
      });
    });

    it('dispatches for an integer balance string', () => {
      renderHook(() => useInitCard());
      sendMessage({
        event: 'change-balance',
        creditPan: '9999',
        balance: '100',
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'wallet/updateCardBalance',
        payload: { pan: '9999', delta: 100 },
      });
    });

    it('does not dispatch when balance is a non-numeric string', () => {
      renderHook(() => useInitCard());
      sendMessage({
        event: 'change-balance',
        creditPan: '1234',
        balance: 'invalid',
      });
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch when balance is "NaN"', () => {
      renderHook(() => useInitCard());
      sendMessage({
        event: 'change-balance',
        creditPan: '1234',
        balance: 'NaN',
      });
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch when balance is Infinity', () => {
      renderHook(() => useInitCard());
      sendMessage({
        event: 'change-balance',
        creditPan: '1234',
        balance: 'Infinity',
      });
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('update-stats event', () => {
    it('dispatches setIncome when the pan matches the current card', () => {
      currentCardPan = 'active-pan';
      renderHook(() => useInitCard());
      const income = { value: 1000, sparkline: [100, 200] };
      sendMessage({
        event: 'update-stats',
        pan: 'active-pan',
        income,
        spending: { value: 0, sparkline: [] },
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'wallet/setIncome',
        payload: income,
      });
    });

    it('dispatches setSpending when the pan matches the current card', () => {
      currentCardPan = 'active-pan';
      renderHook(() => useInitCard());
      const spending = { value: 500, sparkline: [50, 100] };
      sendMessage({
        event: 'update-stats',
        pan: 'active-pan',
        income: { value: 0, sparkline: [] },
        spending,
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'wallet/setSpending',
        payload: spending,
      });
    });

    it('does not dispatch when the pan does not match the current card', () => {
      currentCardPan = 'active-pan';
      renderHook(() => useInitCard());
      sendMessage({
        event: 'update-stats',
        pan: 'other-pan',
        income: {},
        spending: {},
      });
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch when there is no active card (pan is null)', () => {
      currentCardPan = null;
      renderHook(() => useInitCard());
      sendMessage({
        event: 'update-stats',
        pan: 'some-pan',
        income: {},
        spending: {},
      });
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('malformed message', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => ({}));
    });

    it('calls toast.error when the message is not valid JSON', () => {
      renderHook(() => useInitCard());
      getHandler()?.(new MessageEvent('message', { data: 'not-json' }));
      expect(toast.error).toHaveBeenCalled();
    });

    it('calls addNotification with type "security" on a parse failure', () => {
      renderHook(() => useInitCard());
      getHandler()?.(new MessageEvent('message', { data: 'not-json' }));
      expect(mockAddNotification).toHaveBeenCalledWith(
        'security',
        expect.any(String),
        expect.any(String),
      );
    });

    it('does not dispatch any wallet action on a parse failure', () => {
      renderHook(() => useInitCard());
      getHandler()?.(new MessageEvent('message', { data: '{{{' }));
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
