import { render, screen, fireEvent, act } from '@testing-library/react';
import { WalletCard } from './WalletCard';
import type { CardData } from 'types';

const mockUseWalletCards = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@hooks/useWalletCards', () => ({
  useWalletCards: () => mockUseWalletCards(),
}));

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../hooks/useAnimatedBalance', () => ({
  useAnimatedBalance: (val?: number) => val ?? 0,
}));

const card: CardData = {
  pan: '4111111111111111',
  holderName: 'JOHN DOE',
  balance: 1000,
  currency: '$',
  expiry: '12/25',
  cardNetwork: 'visa',
  cardColor: 'violet',
};

// Finds a SPAN whose textContent matches the given regex.
const inSpan = (re: RegExp) => (_: string, el: Element | null) =>
  el?.tagName === 'SPAN' && re.test(el.textContent ?? '');

describe('WalletCard', () => {
  beforeEach(() => {
    mockUseWalletCards.mockReturnValue({ currentCard: card, colors: {} });
    mockUseAuth.mockReturnValue({ username: null });
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when there is no card data', () => {
    mockUseWalletCards.mockReturnValue({ currentCard: null, colors: {} });
    const { container } = render(<WalletCard />);
    expect(container).toBeEmptyDOMElement();
  });

  describe('PAN masking', () => {
    it('shows only the last four digits unmasked by default', () => {
      render(<WalletCard card={card} />);
      expect(screen.getByText(inSpan(/^••••.*1111$/))).toBeInTheDocument();
    });

    it('reveals all digit groups after clicking the reveal button', () => {
      render(<WalletCard card={card} />);
      fireEvent.click(screen.getByLabelText('Reveal card number'));
      expect(
        screen.getByText(inSpan(/^4111.*1111.*1111.*1111$/)),
      ).toBeInTheDocument();
    });

    it('masks the PAN again when toggled back', () => {
      render(<WalletCard card={card} />);
      fireEvent.click(screen.getByLabelText('Reveal card number'));
      fireEvent.click(screen.getByLabelText('Mask card number'));
      expect(screen.getByText(inSpan(/^••••.*1111$/))).toBeInTheDocument();
    });
  });

  describe('balance visibility', () => {
    it('hides the balance with •••••• by default', () => {
      render(<WalletCard card={card} />);
      expect(screen.getByText('••••••')).toBeInTheDocument();
    });

    it('reveals the formatted balance after clicking show', () => {
      render(<WalletCard card={card} />);
      fireEvent.click(screen.getByLabelText('Show balance'));
      expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    });

    it('hides the balance again after toggling back', () => {
      render(<WalletCard card={card} />);
      fireEvent.click(screen.getByLabelText('Show balance'));
      fireEvent.click(screen.getByLabelText('Hide balance'));
      expect(screen.getByText('••••••')).toBeInTheDocument();
    });
  });

  describe('copy to clipboard', () => {
    it('copies the raw PAN digits to the clipboard', () => {
      render(<WalletCard card={card} />);
      fireEvent.click(screen.getByLabelText('Copy card number'));
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '4111111111111111',
      );
    });

    it('allows copying again after the 2 s reset', () => {
      render(<WalletCard card={card} />);
      fireEvent.click(screen.getByLabelText('Copy card number'));
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      fireEvent.click(screen.getByLabelText('Copy card number'));
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(2);
    });
  });

  describe('card source priority', () => {
    it('prefers the card prop over currentCard', () => {
      const other: CardData = { ...card, pan: '5500005555555559' };
      mockUseWalletCards.mockReturnValue({ currentCard: other, colors: {} });
      render(<WalletCard card={card} />);
      // card.pan ends in 1111; other.pan ends in 5559 — 1111 confirms the card prop was used
      expect(screen.getByText(inSpan(/1111$/))).toBeInTheDocument();
    });

    it('uses currentCard when no card prop is given', () => {
      render(<WalletCard />);
      expect(screen.getByText(inSpan(/1111$/))).toBeInTheDocument();
    });
  });

  describe('holder name', () => {
    it('displays username from useAuth when available', () => {
      mockUseAuth.mockReturnValue({ username: 'alice' });
      render(<WalletCard card={card} />);
      expect(screen.getByText('alice')).toBeInTheDocument();
    });

    it('falls back to card.holderName when username is null', () => {
      render(<WalletCard card={card} />);
      expect(screen.getByText('JOHN DOE')).toBeInTheDocument();
    });
  });
});
