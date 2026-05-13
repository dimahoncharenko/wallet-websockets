import { render, screen, fireEvent, act } from '@testing-library/react';
import { TransferModal } from './TransferModal';

// useOpenTransfers uses requestAnimationFrame to set mounted=true.
// Mock it synchronously so mounted state is deterministic in tests.
beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('TransferModal', () => {
  it('renders the heading, subtitle, and form inputs when open', () => {
    render(
      <TransferModal isOpen={true} onClose={vi.fn()} onTransfer={vi.fn()} />,
    );
    expect(screen.getByText('Transfer Funds')).toBeInTheDocument();
    expect(
      screen.getByText('Send money instantly to any card.'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('0000 0000 0000 0000'),
    ).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('shows Cancel and Send Now buttons', () => {
    render(
      <TransferModal isOpen={true} onClose={vi.fn()} onTransfer={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Now' })).toBeInTheDocument();
  });

  it('calls onClose when the backdrop overlay is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <TransferModal isOpen={true} onClose={onClose} onTransfer={vi.fn()} />,
    );
    fireEvent.click(container.querySelector('.backdrop-blur-md')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onTransfer with the sanitized PAN and numeric amount on submit', () => {
    const onTransfer = vi.fn();
    render(
      <TransferModal isOpen={true} onClose={vi.fn()} onTransfer={onTransfer} />,
    );

    // Fire changes so TransferModal's internal state updates via setPan / setAmount.
    // handlePanChange inside TransferForm formats the raw digits with maskPan.
    fireEvent.change(screen.getByPlaceholderText('0000 0000 0000 0000'), {
      target: { value: '1234567890123456' },
    });
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '75' },
    });

    // Both inputs have been updated; the submit button is now enabled.
    const form = screen
      .getByRole('button', { name: 'Send Now' })
      .closest('form')!;
    fireEvent.submit(form);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onTransfer).toHaveBeenCalledWith('1234567890123456', 75);
  });
});
